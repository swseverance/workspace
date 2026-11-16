import { CloudBillingClient } from '@google-cloud/billing';
import { setGlobalOptions } from 'firebase-functions';
import * as logger from 'firebase-functions/logger';
import { onMessagePublished } from 'firebase-functions/v2/pubsub';

setGlobalOptions({ maxInstances: 1 });

const BILLING_ACCOUNT = 'billingAccounts/01FDE7-171975-839040';

// The project hosting this function. Unlinked last, and only once every
// other project is unlinked: if one fails, the kill switch stays alive so the
// next budget alert retries it. After a full kill, relink this project first.
const SELF_PROJECT = 'fir-billing-dd1db';

export type BudgetAlertData = {
  costAmount?: number;
  budgetAmount?: number;
  dryRun?: boolean;
};

export const billingKillSwitch = onMessagePublished(
  {
    topic: 'billing-kill-switch',
    // Where the function is already deployed; stated so a redeploy can
    // never move it.
    region: 'us-east1',
    // A dedicated account that does nothing else, so billing admin is not
    // held by the project's default compute account.
    serviceAccount:
      'billing-kill-switch@fir-billing-dd1db.iam.gserviceaccount.com',
  },
  async (event) => {
    const data: BudgetAlertData = JSON.parse(
      Buffer.from(event.data.message.data, 'base64').toString(),
    );

    logger.info('Budget alert received', { data });

    if ((data.costAmount ?? 0) <= (data.budgetAmount ?? Infinity)) {
      logger.info('Cost within budget, skipping', {
        cost: data.costAmount,
        budget: data.budgetAmount,
      });
      return;
    }

    logger.warn('Budget exceeded — unlinking billing from all projects', {
      cost: data.costAmount,
      budget: data.budgetAmount,
    });

    const client = new CloudBillingClient();

    const enabled = await client
      .listProjectBillingInfo({ name: BILLING_ACCOUNT })
      .then(([projects]) =>
        projects
          .filter((p) => p.billingEnabled)
          // Self last, so the function isn't cut off before the rest are done.
          .sort(
            (a, b) =>
              Number(a.projectId === SELF_PROJECT) -
              Number(b.projectId === SELF_PROJECT),
          ),
      );

    if (data.dryRun) {
      logger.info('DRY RUN — would unlink', {
        projects: enabled.map((p) => p.projectId),
      });
      return;
    }

    logger.info(`Unlinking ${enabled.length} projects`);

    let failures = 0;

    for (const { projectId } of enabled) {
      if (projectId === SELF_PROJECT && failures > 0) {
        logger.error(
          `${failures} projects failed to unlink — keeping ${SELF_PROJECT} linked to retry on the next alert`,
        );
        continue;
      }

      try {
        await client.updateProjectBillingInfo({
          name: `projects/${projectId}`,
          projectBillingInfo: { billingAccountName: '' },
        });

        logger.info(`Unlinked: ${projectId}`);
      } catch (error) {
        failures++;
        logger.error(`Failed to unlink ${projectId}`, error);
      }
    }
  },
);
