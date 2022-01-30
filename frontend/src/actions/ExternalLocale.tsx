import { systemLanguages } from "../Data";

export type LocaleData = Record<
  keyof typeof systemLanguages,
  Record<string, string>
>;

export enum ExternalLocaleStates {
  EMPTY,
  FETCHING,
  SUCCESS,
  ERROR,
}

export type ExternalLocaleState =
  | { type: typeof ExternalLocaleStates.EMPTY; data?: LocaleData }
  | { type: typeof ExternalLocaleStates.FETCHING; data?: LocaleData }
  | {
      type: typeof ExternalLocaleStates.ERROR;
      data?: LocaleData;
      error: string;
    }
  | { type: typeof ExternalLocaleStates.SUCCESS; data: LocaleData };

export const initialExternalLocaleState: ExternalLocaleState = {
  type: ExternalLocaleStates.EMPTY,
  data: {},
};

export const externalLocaleReducer = (
  state: ExternalLocaleState,
  action: ExternalLocaleState
): ExternalLocaleState => {
  switch (action.type) {
    case ExternalLocaleStates.FETCHING:
      return { ...state, type: ExternalLocaleStates.FETCHING };
    case ExternalLocaleStates.SUCCESS:
      const data: LocaleData = action.data;

      for (const locale in state.data) {
        data[locale] = { ...data[locale], ...state.data[locale] };
      }

      return { ...state, type: ExternalLocaleStates.SUCCESS, data: data };
    case ExternalLocaleStates.ERROR:
      return {
        ...state,
        type: ExternalLocaleStates.ERROR,
        error: action.error,
      };
    default:
      return { ...state, ...initialExternalLocaleState };
  }
};
