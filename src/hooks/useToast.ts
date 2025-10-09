// hooks/useToast.ts
import { toast } from 'react-toastify';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
	type: ToastType;
	message: string;
	autoClose?: number;
}

export const useToast = () => {
	const showToast = ({ type, message, autoClose = 5000 }: ToastOptions) => {
		switch (type) {
			case 'success':
				toast.success(message, {
					position: 'top-right',
					autoClose: autoClose
				});
				break;
			case 'error':
				toast.error(message, {
					position: 'top-right',
					autoClose: autoClose
				});
				break;
			case 'info':
				toast.info(message, {
					position: 'top-right',
					autoClose: autoClose
				});
				break;
			case 'warning':
				toast.warning(message, {
					position: 'top-right',
					autoClose: autoClose
				});
				break;
			default:
				toast(message, {
					position: 'top-right',
					autoClose: autoClose
				});
		}
	};

	return { showToast };
};
