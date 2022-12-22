import {Component, Inject, OnInit} from '@angular/core';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {PrivacyTermComponent} from '@frontend/shared';
import {ToastrService} from 'ngx-toastr';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {Subject, takeUntil} from 'rxjs';
import {Store, select} from '@ngrx/store';
import {AuthState, Register, getAuthError, getRegisterUser, AuthService, ResetAuthState} from '@frontend/auth-store';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {APP_CONFIG} from "@frontend/app-config";


@Component({
  selector: 'frontend-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  getCountriesData: any;
  showPassword = false;
  registerForm!: UntypedFormGroup;
  isRegisterWithPhoneNumber = false;
  unsubscriber = new Subject();
  RegExpValidator = {
    lowerCase: RegExp(/^(?=.*?[a-z])/),
    upperCase: RegExp(/^(?=.*?[A-Z])/),
    digit: RegExp(/^(?=.*?[0-9])/),
    specialChar: RegExp(/^(?=.*?[" !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"])/),
    email: RegExp(/^[a-zA-z0-9._%+-]+@[a-zA-z0-9.-]+\.[a-zA-z]{2,4}$/),
  };

  constructor(
    private modelService: BsModalService,
    private toastr: ToastrService,
    private formBuilder: UntypedFormBuilder,
    private authStore: Store<AuthState>,
    private router: Router,
    private translateService: TranslateService,
    private authService: AuthService,
    @Inject(APP_CONFIG) private appConfig: any,
  ) {
  }

  subscribeToStore() {
    this.authStore
      .pipe(select(getRegisterUser))
      .pipe(takeUntil(this.unsubscriber))
      .subscribe((registerUser: any) => {
        if (registerUser?.phone_number) {
          this.router.navigate(['/validate-mobile']);
        } else if (registerUser?.email) {
          this.toastr.success(
            this.translateService.instant('verify_email_sent')
          );
        }
      });

    this.authStore
      .pipe(select(getAuthError))
      .pipe(takeUntil(this.unsubscriber))
      .subscribe((error) => {
        if (error) {
          this.toastr.error(error);
        }
      });
  }

  showPrivacyTerms(activeTab: string) {
    const modelRef: BsModalRef = this.modelService.show(PrivacyTermComponent, {
      keyboard: true,
      animated: true,
      ignoreBackdropClick: false,
      class: 'modal-xl modal-dialog-centered',
      initialState: {
        showHeader: false
      }
    });
    modelRef.content.activeTab = activeTab;
  }

  changeLoginType(isWithPhone: any) {
    this.isRegisterWithPhoneNumber = isWithPhone;
    if (this.isRegisterWithPhoneNumber) {
      this.registerForm?.patchValue({email: '', phone: ''});
      this.registerForm?.get('email')?.clearValidators();
      this.registerForm?.get('phone')?.setValidators(Validators.required);
    } else {
      this.registerForm?.patchValue({email: '', phone: ''});
      this.registerForm?.get('phone')?.clearValidators();
      this.registerForm
        ?.get('email')
        ?.setValidators([
          Validators.required,
          Validators.pattern(this.RegExpValidator.email),
        ]);
    }
    this.registerForm.get('email')?.updateValueAndValidity();
    this.registerForm.get('phone')?.updateValueAndValidity();
  }

  // made this function to check custom toast, It can be removed

  // showToaster(){
  //   this.toastr.success("srdetgryg");
  // }

  ngOnInit(): void {
    this.authStore.dispatch(ResetAuthState({params: {error: '', success: ''}}));
    this.subscribeToStore();
    this.getCountryId();
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      phone: [''],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(30),
          this.validate('lowerCase', this.RegExpValidator.lowerCase),
          this.validate('upperCase', this.RegExpValidator.upperCase),
          this.validate('digit', this.RegExpValidator.digit),
          this.validate('specialChar', this.RegExpValidator.specialChar),
        ]),
      ],
      terms: ['', Validators.requiredTrue],
    });
  }

  get form() {
    return this.registerForm.controls;
  }

  validate(criteria: string, regex: RegExp): ValidatorFn {
    return (control: AbstractControl): any => {
      if (!control || !control.value || control.value.length === 0) {
        return undefined;
      }
      if (!regex.test(control.value)) {
        const failed: any = {};
        failed[criteria] = {
          actualValue: control.value,
          requiredPattern: regex,
        };
        return failed;
      }
      return undefined;
    };
  }

  submitForm() {
    this.registerForm.value.email = this.registerForm.value.email.trim() || '';
    const formValues = {...this.registerForm.value};
    const body: any = this.getBody(formValues);
    this.authStore.dispatch(Register({user: body}));
    // this.toastr.success('succes');
  }

  getBody(formValues: any) {
    return {
      first_name: formValues.firstName,
      last_name: formValues.lastName,
      ...(this.isRegisterWithPhoneNumber
        ? {
          phone_number: (formValues.phone?.number || '').replace(/\s/g, ''),
          country_id:
            this.getSelectedCountryIDByPhoneCode(
              formValues.phone?.dialCode.replace('+', '')
            ) || '',
        }
        : {
          email: formValues.email,
        }),
      password: formValues.password,
      role: this.appConfig.applicationType || 'artist'
    };
  }

  getCountryId() {
    this.authService.getCountryId().subscribe((res) => {
      this.getCountriesData = res;
    });
  }

  getSelectedCountryIDByPhoneCode(phoneCode: number) {
    let countryId = 0;
    let selectedCountryID = '';
    for (
      countryId = 0;
      countryId <= this.getCountriesData.data.length;
      countryId++
    ) {
      if (this.getCountriesData.data[countryId]?.phone_code == phoneCode) {
        selectedCountryID = this.getCountriesData.data[countryId].id;
      }
    }
    return selectedCountryID;
  }
}
