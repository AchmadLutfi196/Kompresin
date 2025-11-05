import Swal from 'sweetalert2';

// Custom SweetAlert configurations with teal theme
const swalConfig = {
  customClass: {
    confirmButton: 'bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200',
    cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200 mr-2',
    popup: 'rounded-xl shadow-2xl',
    title: 'text-gray-800 font-bold',
    htmlContainer: 'text-gray-600',
  },
  buttonsStyling: false,
  confirmButtonColor: '#0d9488',
  cancelButtonColor: '#6b7280',
};

export const SweetAlert = {
  // Success notification
  success: (title: string, text?: string) => {
    return Swal.fire({
      ...swalConfig,
      icon: 'success',
      title,
      text,
      confirmButtonText: 'OK',
      timer: 3000,
      timerProgressBar: true,
    });
  },

  // Error notification
  error: (title: string, text?: string) => {
    return Swal.fire({
      ...swalConfig,
      icon: 'error',
      title,
      text,
      confirmButtonText: 'OK',
    });
  },

  // Warning notification
  warning: (title: string, text?: string) => {
    return Swal.fire({
      ...swalConfig,
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'OK',
    });
  },

  // Info notification
  info: (title: string, text?: string) => {
    return Swal.fire({
      ...swalConfig,
      icon: 'info',
      title,
      text,
      confirmButtonText: 'OK',
    });
  },

  // Confirmation dialog
  confirm: (title: string, text?: string, confirmText: string = 'Ya', cancelText: string = 'Batal') => {
    return Swal.fire({
      ...swalConfig,
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
    });
  },

  // Delete confirmation
  confirmDelete: (title: string = 'Hapus Data?', text: string = 'Data yang dihapus tidak dapat dikembalikan!') => {
    return Swal.fire({
      ...swalConfig,
      icon: 'warning',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      customClass: {
        ...swalConfig.customClass,
        confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200',
      },
    });
  },

  // Loading notification
  loading: (title: string = 'Memproses...', text?: string) => {
    return Swal.fire({
      ...swalConfig,
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },

  // Close loading
  close: () => {
    Swal.close();
  },

  // Toast notification (small notification at corner)
  toast: {
    success: (message: string) => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });

      return Toast.fire({
        icon: 'success',
        title: message,
        customClass: {
          popup: 'rounded-lg shadow-lg bg-white border-l-4 border-teal-500',
          title: 'text-gray-800 text-sm font-medium',
        }
      });
    },

    error: (message: string) => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });

      return Toast.fire({
        icon: 'error',
        title: message,
        customClass: {
          popup: 'rounded-lg shadow-lg bg-white border-l-4 border-red-500',
          title: 'text-gray-800 text-sm font-medium',
        }
      });
    },

    info: (message: string) => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
      });

      return Toast.fire({
        icon: 'info',
        title: message,
        customClass: {
          popup: 'rounded-lg shadow-lg bg-white border-l-4 border-blue-500',
          title: 'text-gray-800 text-sm font-medium',
        }
      });
    }
  }
};

export default SweetAlert;