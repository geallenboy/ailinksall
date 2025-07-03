import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/features/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/types/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/translate/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
    	extend: {
    		fontFamily: {
    			momo: [
    				'var(--font-geist-mono)'
    			],
    			sans: [
    				'var(--font-geist-sans)'
    			],
    			inter: ['Inter', 'sans-serif'],
    		},
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			},
    			'color-1': 'hsl(var(--color-1))',
    			'color-2': 'hsl(var(--color-2))',
    			'color-3': 'hsl(var(--color-3))',
    			'color-4': 'hsl(var(--color-4))',
    			'color-5': 'hsl(var(--color-5))',
    			// 新增品牌色彩
    			brand: {
    				50: '#eff6ff',
    				100: '#dbeafe',
    				200: '#bfdbfe',
    				300: '#93c5fd',
    				400: '#60a5fa',
    				500: '#3b82f6',
    				600: '#2563eb',
    				700: '#1d4ed8',
    				800: '#1e40af',
    				900: '#1e3a8a',
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)',
    			'4xl': '2rem',
    		},
    		spacing: {
    			'18': '4.5rem',
    			'88': '22rem',
    		},
    		maxWidth: {
    			'8xl': '88rem',
    			'9xl': '96rem',
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			},
    			gradient: {
    				to: {
    					backgroundPosition: 'var(--bg-size) 0'
    				}
    			},
    			marquee: {
    				from: {
    					transform: 'translateX(0)'
    				},
    				to: {
    					transform: 'translateX(calc(-100% - var(--gap)))'
    				}
    			},
    			'marquee-vertical': {
    				from: {
    					transform: 'translateY(0)'
    				},
    				to: {
    					transform: 'translateY(calc(-100% - var(--gap)))'
    				}
    			},
    			'aurora-border': {
    				'0%, 100%': {
    					borderRadius: '37% 29% 27% 27% / 28% 25% 41% 37%'
    				},
    				'25%': {
    					borderRadius: '47% 29% 39% 49% / 61% 19% 66% 26%'
    				},
    				'50%': {
    					borderRadius: '57% 23% 47% 72% / 63% 17% 66% 33%'
    				},
    				'75%': {
    					borderRadius: '28% 49% 29% 100% / 93% 20% 64% 25%'
    				}
    			},
    			'aurora-1': {
    				'0%, 100%': {
    					top: '0',
    					right: '0'
    				},
    				'50%': {
    					top: '50%',
    					right: '25%'
    				},
    				'75%': {
    					top: '25%',
    					right: '50%'
    				}
    			},
    			'aurora-2': {
    				'0%, 100%': {
    					top: '0',
    					left: '0'
    				},
    				'60%': {
    					top: '75%',
    					left: '25%'
    				},
    				'85%': {
    					top: '50%',
    					left: '50%'
    				}
    			},
    			'aurora-3': {
    				'0%, 100%': {
    					bottom: '0',
    					left: '0'
    				},
    				'40%': {
    					bottom: '50%',
    					left: '25%'
    				},
    				'65%': {
    					bottom: '25%',
    					left: '50%'
    				}
    			},
    			'aurora-4': {
    				'0%, 100%': {
    					bottom: '0',
    					right: '0'
    				},
    				'50%': {
    					bottom: '25%',
    					right: '40%'
    				},
    				'90%': {
    					bottom: '50%',
    					right: '25%'
    				}
    			},
    			// 新增动画
    			'float': {
    				'0%, 100%': { transform: 'translateY(0px)' },
    				'50%': { transform: 'translateY(-10px)' }
    			},
    			'pulse-glow': {
    				'0%, 100%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.1)' },
    				'50%': { boxShadow: '0 0 40px hsl(var(--primary) / 0.3)' }
    			},
    			'slide-up': {
    				'0%': { transform: 'translateY(20px)', opacity: '0' },
    				'100%': { transform: 'translateY(0px)', opacity: '1' }
    			},
    			'fade-in': {
    				'0%': { opacity: '0' },
    				'100%': { opacity: '1' }
    			},
    			'scale-in': {
    				'0%': { transform: 'scale(0.95)', opacity: '0' },
    				'100%': { transform: 'scale(1)', opacity: '1' }
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			gradient: 'gradient 8s linear infinite',
    			marquee: 'marquee var(--duration) infinite linear',
    			'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
    			// 新增动画
    			'float': 'float 6s ease-in-out infinite',
    			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
    			'slide-up': 'slide-up 0.5s ease-out',
    			'fade-in': 'fade-in 0.3s ease-out',
    			'scale-in': 'scale-in 0.2s ease-out'
    		},
    		screens: {
    			xs: '480px',
    			'3xl': '1600px'
    		},
    		backdropBlur: {
    			xs: '2px',
    		},
    		boxShadow: {
    			'inner-lg': 'inset 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    			'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
    			'glow-lg': '0 0 40px rgba(59, 130, 246, 0.2)',
    		}
    	}
    },
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/typography"),
	],
} satisfies Config;
