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
					// position: 'top-right',
					autoClose,
					hideProgressBar: true,
					style: {
						backgroundColor: '#4CAF50', // Green for success
						color: 'white',
						borderRadius: '8px',
					},
				});
				break;
			case 'error':
				toast.error(message, {
					// position: 'top-right',
					autoClose,
					hideProgressBar: true,
					style: {
						backgroundColor: '#28313b', // Red for error
						color: 'white',
						borderRadius: '8px',
					},
				});
				break;
			case 'info':
				toast.info(message, {
					// position: 'top-right',
					autoClose,
					hideProgressBar: true,
					style: {
						backgroundColor: '#2196F3', // Blue for info
						color: 'white',
						borderRadius: '8px',
					},
				});
				break;
			case 'warning':
				toast.warning(message, {
					// position: 'top-right',
					autoClose,
					hideProgressBar: true,
					style: {
						backgroundColor: '#ff9800', // Yellow for warning
						color: 'white',
						borderRadius: '8px',
					},
				});
				break;
			default:
				toast(message, {
					// position: 'top-right',
					autoClose,
					hideProgressBar: true,
					style: {
						backgroundColor: '#000', // Default dark background
						color: 'white',
						borderRadius: '8px',
					},
				});
		}
	};

	return { showToast };
};
