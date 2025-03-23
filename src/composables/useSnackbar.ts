import { message } from 'ant-design-vue';

export function useSnackbar() {
  const showSuccess = (content: string) => {
    message.success(content);
  };

  const showError = (content: string) => {
    message.error(content);
  };

  const showWarning = (content: string) => {
    message.warning(content);
  };

  const showInfo = (content: string) => {
    message.info(content);
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}