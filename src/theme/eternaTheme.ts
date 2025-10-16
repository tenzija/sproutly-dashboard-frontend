// theme/eternaTheme.ts
import { createTheme } from '@mui/material/styles';

export const eternaTheme = createTheme({
	typography: {
		fontFamily: 'var(--font-satoshi), ui-sans-serif, system-ui, sans-serif',
	},
	palette: {
		mode: 'dark',
		primary: { main: '#b7ff57' }, // neon green
		background: { default: '#0b0b0b', paper: '#0b0b0b' },
		text: { primary: '#ffffff' },
	},
	shape: { borderRadius: 16 },
	components: {
		// Outlined inputs (TextField + Select share this)
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					backgroundColor: 'rgba(255,255,255,0.06)',
					borderRadius: 16,
					'& .MuiOutlinedInput-notchedOutline': {
						borderColor: 'rgba(255,255,255,0.14)',
					},
					'&:hover .MuiOutlinedInput-notchedOutline': {
						borderColor: 'rgba(183,255,87,0.8)',
					},
					'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
						borderColor: '#b7ff57',
						boxShadow: '0 0 0 2px rgba(183,255,87,0.25)', // subtle glow
					},
					'& .MuiSelect-icon': { color: '#fff' },
				},
				input: {
					// keep text readable
					color: '#fff',
				},
			},
		},

		// The dropdown popup (menu)
		MuiMenu: {
			styleOverrides: {
				paper: {
					backgroundColor: 'rgba(15,15,15,0.96)', // match modal surface
					border: '1px solid rgba(255,255,255,0.12)',
					borderRadius: 16,
					backdropFilter: 'blur(4px)',
				},
				list: {
					paddingTop: 6,
					paddingBottom: 6,
				},
			},
		},

		MuiMenuItem: {
			styleOverrides: {
				root: {
					color: '#fff',
					'&.Mui-selected': {
						backgroundColor: 'rgba(183,255,87,0.12)',
						'&:hover': { backgroundColor: 'rgba(183,255,87,0.18)' },
					},
					'&:hover': {
						backgroundColor: 'rgba(255,255,255,0.06)',
					},
				},
			},
		},
	},
});
