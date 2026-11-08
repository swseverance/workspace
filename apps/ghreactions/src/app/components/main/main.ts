import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Theme } from '@org/theme';
import { AgGridAngular } from 'ag-grid-angular';
import type { GridApi, GridReadyEvent } from 'ag-grid-community';
import { colorSchemeDark, themeQuartz } from 'ag-grid-community';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Adapter } from '../../../models/adapter';
import {
  IssueState,
  PullRequestState,
  ReactableType,
  ReactionsFilter,
} from '../../../models/github';
import { GHReactionsRow } from '../../../models/table';
import { Data } from '../../services/data';
import { IS_MOBILE } from '../../tokens';
import { COLUMNS, DEFAULT_COL_DEF } from './columns';
import { TYPE_CONFIG, TYPE_OPTIONS } from './options';

@Component({
  selector: 'app-main',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzCollapseModule,
    NzGridModule,
    NzIconModule,
    AgGridAngular,
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main implements OnInit, Adapter {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private meta = inject(Meta);
  private dataService = inject(Data);
  protected theme = inject(Theme);
  protected mobile = inject(IS_MOBILE);

  private gridApi!: GridApi<GHReactionsRow>;

  readonly lightTheme = themeQuartz;
  readonly darkTheme = themeQuartz.withPart(colorSchemeDark);

  readonly columns = COLUMNS;

  ReactableType = ReactableType;

  typeOptions = TYPE_OPTIONS;

  typeConfig = TYPE_CONFIG;

  requestPending = false;

  defaultModel = {
    username: '',
    type: ReactableType.Issue,
    state: TYPE_CONFIG[ReactableType.Issue].state,
    reactions: TYPE_CONFIG[ReactableType.Issue].reactions,
  };

  form = new FormGroup({
    username: new FormControl<string>(this.defaultModel.username, {
      nonNullable: true,
      validators: Validators.required,
    }),
    type: new FormControl<ReactableType>(this.defaultModel.type, {
      nonNullable: true,
    }),
    state: new FormControl<IssueState[] | PullRequestState[]>(
      this.defaultModel.state,
      {
        nonNullable: true,
      },
    ),
    reactions: new FormControl<ReactionsFilter[]>(this.defaultModel.reactions, {
      nonNullable: true,
    }),
  });

  defaultColDef = DEFAULT_COL_DEF;

  filterFunction() {
    return true;
  }

  onGridReady(event: GridReadyEvent<GHReactionsRow>): void {
    this.gridApi = event.api;

    this.gridApi.setGridOption(
      'overlayNoRowsTemplate',
      '<span>No results</span>',
    );

    if (this.form.valid) this.setDataSource();
    else this.gridApi.showNoRowsOverlay();
  }

  onSearch(): void {
    if (this.requestPending) return;

    const queryParams: Params = {};

    for (const [key, value] of Object.entries(this.form.getRawValue())) {
      if (value) queryParams[key] = value;
    }

    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'replace',
    });

    this.setDataSource();
  }

  private setDataSource(): void {
    this.requestPending = true;
    this.gridApi.setGridOption(
      'datasource',
      this.dataService.create(this.form.getRawValue()),
    );
  }

  onServerSuccess(): void {
    this.requestPending = false;
  }

  onServerError({ status }: HttpErrorResponse): void {
    this.requestPending = false;
    if (status === 400) {
      const { username, type, state, reactions } = this.defaultModel;
      this.form.get('username')!.setValue(username);
      this.form.get('type')!.setValue(type);
      this.form.get('state')!.setValue(state);
      this.form.get('reactions')!.setValue(reactions);
    }
  }

  ngOnInit(): void {
    this.meta.updateTag({
      name: 'description',
      content:
        'Search GitHub for reactions to issues, pull requests, and comments. Filter by state, type, and reactions.',
    });

    this.form
      .get('type')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type) => {
        const {
          state: defaultState,
          stateEnabled,
          reactions: defaultReactions,
          reactionsEnabled,
        } = TYPE_CONFIG[type];

        const state = this.form.get('state')!;
        state.setValue(defaultState);
        stateEnabled ? state.enable() : state.disable();

        const reactions = this.form.get('reactions')!;
        reactions.setValue(defaultReactions);
        reactionsEnabled ? reactions.enable() : reactions.disable();
      });

    const {
      username,
      type,
      state: rawState,
      reactions: rawReactions,
    } = this.route.snapshot.queryParams;

    if (username && typeof username === 'string') {
      this.form.patchValue({ username: username as string });
    }

    if (type && typeof type === 'string') {
      this.form.patchValue({ type: type as ReactableType });

      const state = rawState ?? [];

      this.form.patchValue({
        state: Array.isArray(state) ? state : [state],
      });

      const reactions = rawReactions ?? [];

      this.form.patchValue({
        reactions: Array.isArray(reactions) ? reactions : [reactions],
      });
    }
  }
}
