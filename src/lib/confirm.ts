/** Diálogo de confirmación propio, en lugar del `confirm()` del navegador. */

export interface ConfirmOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

let pending: ((value: boolean) => void) | null = null;
let previousFocus: HTMLElement | null = null;

const finish = (value: boolean) => {
  const dialog = document.getElementById('confirm-dialog');
  if (!dialog || dialog.classList.contains('hidden')) return;
  dialog.classList.add('hidden');
  document.body.classList.remove('modal-open');
  previousFocus?.focus();
  previousFocus = null;
  const resolver = pending;
  pending = null;
  resolver?.(value);
};

/** Abre el diálogo y devuelve true si el usuario confirma. */
export function confirmDialog(message: string, options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    const dialog = document.getElementById('confirm-dialog');
    if (!dialog) {
      resolve(false);
      return;
    }
    if (pending) finish(false);

    pending = resolve;
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const title = document.getElementById('confirm-title');
    const text = document.getElementById('confirm-message');
    const accept = document.getElementById('confirm-accept') as HTMLButtonElement | null;
    const cancel = document.getElementById('confirm-cancel') as HTMLButtonElement | null;

    if (title) title.textContent = options.title ?? '¿Estás seguro?';
    if (text) text.textContent = message;
    if (accept) {
      accept.textContent = options.confirmLabel ?? 'Eliminar';
      accept.classList.toggle('danger-btn', options.danger !== false);
    }
    if (cancel) cancel.textContent = options.cancelLabel ?? 'Cancelar';

    dialog.classList.remove('hidden');
    document.body.classList.add('modal-open');
    accept?.focus();
  });
}

/** Registra una sola vez los eventos del diálogo (se llama desde el layout). */
export function setupConfirmDialog(): void {
  const dialog = document.getElementById('confirm-dialog');
  document.getElementById('confirm-accept')?.addEventListener('click', () => finish(true));
  document.getElementById('confirm-cancel')?.addEventListener('click', () => finish(false));
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) finish(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dialog && !dialog.classList.contains('hidden')) finish(false);
  });
}
