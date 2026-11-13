import { TestBed } from '@angular/core/testing';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { Subject } from 'rxjs';
import { AuthFacade } from '../store/auth.facade';
import { SignInDialog, SignInDialogData } from './sign-in-dialog';

describe('SignInDialog', () => {
  let results: Subject<string | null>;
  const modalRef = { close: vi.fn() };
  const auth = {
    sendSignInLink: vi.fn(),
    get signInLinkResult$() {
      return results;
    },
  };

  function render(mode: SignInDialogData['mode']) {
    results = new Subject();
    TestBed.configureTestingModule({
      imports: [SignInDialog],
      providers: [
        { provide: AuthFacade, useValue: auth },
        { provide: NzModalRef, useValue: modalRef },
        { provide: NZ_MODAL_DATA, useValue: { mode } },
      ],
    });
    const fixture = TestBed.createComponent(SignInDialog);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    function type(email: string) {
      const input = element.querySelector('input')!;
      input.value = email;
      input.dispatchEvent(new Event('input'));
    }

    function submit() {
      element.querySelector('form')!.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
    }

    return { fixture, element, type, submit };
  }

  beforeEach(() => vi.clearAllMocks());

  it('closes with Google', () => {
    const { element } = render('signIn');

    (element.querySelector('button') as HTMLButtonElement).click();

    expect(modalRef.close).toHaveBeenCalledWith({ provider: 'google' });
  });

  it('asks for a link, then says where it went', async () => {
    const { fixture, element, type, submit } = render('signIn');

    type(' a@b.com ');
    submit();
    results.next('a@b.com');
    fixture.detectChanges();

    expect(auth.sendSignInLink).toHaveBeenCalledWith('a@b.com');
    expect(element.textContent).toContain('we sent a sign-in link to');
    expect(element.textContent).toContain('a@b.com');
    expect(modalRef.close).not.toHaveBeenCalled();
  });

  it('lets the user try again after a failed send', () => {
    const { fixture, type, submit } = render('signIn');

    type('a@b.com');
    submit();
    results.next(null);
    fixture.detectChanges();
    submit();

    expect(auth.sendSignInLink).toHaveBeenCalledTimes(2);
  });

  it('sends nothing without an address', () => {
    const { submit } = render('signIn');

    submit();

    expect(auth.sendSignInLink).not.toHaveBeenCalled();
  });

  it('closes with the confirmed address', () => {
    const { type, submit } = render('confirmEmail');

    type('a@b.com');
    submit();

    expect(modalRef.close).toHaveBeenCalledWith({ email: 'a@b.com' });
  });
});
