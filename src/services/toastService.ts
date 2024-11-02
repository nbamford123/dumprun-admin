import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

const escapeHtml = (html: string): string => {
	const div = document.createElement('div');
	div.textContent = html;
	return div.innerHTML;
};

// Custom function to emit toast notifications
export const notify = (
	message: string,
	variant = 'primary',
	icon = 'info-circle',
	duration = 3000,
) => {
	const alert = Object.assign(document.createElement('sl-alert'), {
		variant,
		closable: true,
		duration: duration,
		innerHTML: `
      <sl-icon name="${icon}" slot="icon"></sl-icon>
      ${escapeHtml(message)}
    `,
	});
	document.body.append(alert);
	return alert.toast();
};
