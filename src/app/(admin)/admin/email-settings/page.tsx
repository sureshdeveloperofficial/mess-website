'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface EmailSettingsState {
    smtp_host: string
    smtp_port: string
    smtp_secure: string
    smtp_user: string
    smtp_pass: string
    smtp_from_name: string
    smtp_from_email: string
    admin_notification_email: string
}

export default function EmailSettingsPage() {
    const queryClient = useQueryClient()
    const [showPassword, setShowPassword] = useState(false)
    const [testRecipient, setTestRecipient] = useState('')
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [justSaved, setJustSaved] = useState(false)

    const [formData, setFormData] = useState<EmailSettingsState>({
        smtp_host: 'smtp.office365.com',
        smtp_port: '587',
        smtp_secure: 'false',
        smtp_user: '',
        smtp_pass: '',
        smtp_from_name: "Chef's Kitchen",
        smtp_from_email: '',
        admin_notification_email: '',
    })

    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await axios.get('/api/settings')
            return res.data
        },
    })

    useEffect(() => {
        if (settings) {
            setFormData({
                smtp_host: settings.smtp_host || 'smtp.office365.com',
                smtp_port: settings.smtp_port || '587',
                smtp_secure: settings.smtp_secure !== undefined ? settings.smtp_secure : 'false',
                smtp_user: settings.smtp_user || '',
                smtp_pass: settings.smtp_pass || '',
                smtp_from_name: settings.smtp_from_name || settings.restaurant_name || "Chef's Kitchen",
                smtp_from_email: settings.smtp_from_email || settings.contact_email || settings.smtp_user || '',
                admin_notification_email: settings.admin_notification_email || settings.contact_email || settings.smtp_user || '',
            })
        }
    }, [settings])

    const saveMutation = useMutation({
        mutationFn: async (newSettings: EmailSettingsState) => {
            const res = await axios.post('/api/settings', { settings: newSettings })
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] })
            setJustSaved(true)
            toast.success('Email settings saved successfully!')
            setTimeout(() => setJustSaved(false), 4000)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || 'Failed to save email settings')
        },
    })

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        saveMutation.mutate(formData)
    }

    const handlePortChange = (val: string) => {
        const portStr = val.trim()
        let autoSecure = formData.smtp_secure
        if (portStr === '465') {
            autoSecure = 'true'
        } else if (portStr === '587' || portStr === '25') {
            autoSecure = 'false'
        }
        setFormData(prev => ({
            ...prev,
            smtp_port: portStr,
            smtp_secure: autoSecure
        }))
    }

    const applyPreset = (preset: 'gmail' | 'brevo' | 'sendgrid' | 'outlook' | 'custom') => {
        if (preset === 'gmail') {
            setFormData(prev => ({
                ...prev,
                smtp_host: 'smtp.gmail.com',
                smtp_port: '465',
                smtp_secure: 'true',
            }))
            toast.success('Applied Gmail Preset (Port 465 SSL/TLS)')
        } else if (preset === 'brevo') {
            setFormData(prev => ({
                ...prev,
                smtp_host: 'smtp-relay.brevo.com',
                smtp_port: '587',
                smtp_secure: 'false',
            }))
            toast.success('Applied Brevo / Sendinblue Preset (Port 587 STARTTLS)')
        } else if (preset === 'sendgrid') {
            setFormData(prev => ({
                ...prev,
                smtp_host: 'smtp.sendgrid.net',
                smtp_port: '587',
                smtp_secure: 'false',
                smtp_user: 'apikey',
            }))
            toast.success('Applied SendGrid Preset (Port 587)')
        } else if (preset === 'outlook') {
            setFormData(prev => ({
                ...prev,
                smtp_host: 'smtp.office365.com',
                smtp_port: '587',
                smtp_secure: 'false',
            }))
            toast.success('Applied Microsoft Outlook / Office 365 Preset (Port 587)')
        }
    }

    const handleTestEmail = async () => {
        if (!testRecipient || !testRecipient.includes('@')) {
            toast.error('Please enter a valid recipient email to test.')
            return
        }

        setTesting(true)
        setTestResult(null)

        try {
            // First save active form settings
            await axios.post('/api/settings', { settings: formData })
            queryClient.invalidateQueries({ queryKey: ['settings'] })

            // Dispatch test email
            const res = await axios.post('/api/admin/email-test', { testEmail: testRecipient })
            setTestResult({
                type: 'success',
                message: res.data.message || `Test email successfully sent to ${testRecipient}! Check your inbox.`
            })
            toast.success('Test email sent successfully!')
        } catch (error: any) {
            const msg = error.response?.data?.error || error.message || 'SMTP connection failed.'
            setTestResult({
                type: 'error',
                message: `Connection Failed: ${msg}`
            })
            toast.error('Test email failed. Check the error box for details.')
        } finally {
            setTesting(false)
        }
    }

    return (
        <div className='max-w-6xl mx-auto space-y-8 pb-12'>
            {/* Header */}
            <div>
                <h1 className='admin-page-title'>Email &amp; SMTP Configuration</h1>
                <p className='admin-page-subtitle'>
                    Configure your centralized SMTP mail credentials for order invoices, contact form submissions, and customer alerts.
                </p>
            </div>

            {/* Success Alert Banner */}
            {justSaved && (
                <div className='bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-fade-in shadow-xs'>
                    <Icon icon='solar:check-circle-bold' className='text-xl text-green-600' />
                    <span>Email settings saved successfully! All transactional dispatchers will use these credentials.</span>
                </div>
            )}

            {/* Quick Provider Presets */}
            <div className='bg-white p-6 rounded-3xl border border-grey/10 shadow-sm space-y-3'>
                <h3 className='admin-label mb-0 flex items-center gap-2'>
                    <Icon icon='solar:magic-stick-3-bold-duotone' className='text-primary text-base' />
                    <span>1-Click Provider Presets</span>
                </h3>
                <div className='flex flex-wrap gap-2.5'>
                    <button
                        type='button'
                        onClick={() => applyPreset('outlook')}
                        className='px-4 py-2 bg-grey/5 hover:bg-primary/10 hover:text-grey-dark rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-grey/10 cursor-pointer'
                    >
                        <Icon icon='logos:microsoft-icon' className='text-sm' />
                        <span>Microsoft 365 / Outlook</span>
                    </button>
                    <button
                        type='button'
                        onClick={() => applyPreset('gmail')}
                        className='px-4 py-2 bg-grey/5 hover:bg-primary/10 hover:text-grey-dark rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-grey/10 cursor-pointer'
                    >
                        <Icon icon='logos:google-gmail' className='text-sm' />
                        <span>Gmail (SSL 465)</span>
                    </button>
                    <button
                        type='button'
                        onClick={() => applyPreset('brevo')}
                        className='px-4 py-2 bg-grey/5 hover:bg-primary/10 hover:text-grey-dark rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-grey/10 cursor-pointer'
                    >
                        <Icon icon='simple-icons:brevo' className='text-sm text-blue-600' />
                        <span>Brevo / Sendinblue</span>
                    </button>
                    <button
                        type='button'
                        onClick={() => applyPreset('sendgrid')}
                        className='px-4 py-2 bg-grey/5 hover:bg-primary/10 hover:text-grey-dark rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-grey/10 cursor-pointer'
                    >
                        <Icon icon='logos:sendgrid-icon' className='text-sm' />
                        <span>SendGrid</span>
                    </button>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                {/* Main Settings Form */}
                <form onSubmit={handleSave} className='lg:col-span-2 bg-white p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                    <div className='flex items-center justify-between border-b border-grey/10 pb-4'>
                        <h2 className='text-xl font-bold text-grey-dark flex items-center gap-2.5'>
                            <Icon icon='solar:server-square-bold-duotone' className='text-primary text-2xl' />
                            SMTP Credentials
                        </h2>
                        {isLoading && <span className='text-xs text-grey-muted animate-pulse'>Loading active configuration...</span>}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* SMTP Host */}
                        <div>
                            <label className='admin-label'>SMTP Host Server *</label>
                            <input
                                type='text'
                                required
                                value={formData.smtp_host}
                                onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                                placeholder='smtp.office365.com or smtp.gmail.com'
                                className='admin-input'
                            />
                        </div>

                        {/* SMTP Port */}
                        <div>
                            <label className='admin-label'>Port Number *</label>
                            <input
                                type='text'
                                required
                                value={formData.smtp_port}
                                onChange={(e) => handlePortChange(e.target.value)}
                                placeholder='587 or 465'
                                className='admin-input'
                            />
                        </div>

                        {/* Secure SSL/TLS */}
                        <div>
                            <label className='admin-label'>Encryption Mode</label>
                            <select
                                value={formData.smtp_secure}
                                onChange={(e) => setFormData({ ...formData, smtp_secure: e.target.value })}
                                className='admin-input'
                            >
                                <option value='false'>STARTTLS / Auto (Port 587)</option>
                                <option value='true'>Direct SSL / TLS (Port 465)</option>
                            </select>
                        </div>

                        {/* SMTP Username */}
                        <div>
                            <label className='admin-label'>SMTP Username / Email *</label>
                            <input
                                type='text'
                                required
                                value={formData.smtp_user}
                                onChange={(e) => setFormData({ ...formData, smtp_user: e.target.value })}
                                placeholder='support@rythmtechnical.com'
                                className='admin-input'
                            />
                        </div>

                        {/* SMTP Password / App Password */}
                        <div className='md:col-span-2'>
                            <label className='admin-label'>SMTP Password / App Password *</label>
                            <div className='relative'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.smtp_pass}
                                    onChange={(e) => setFormData({ ...formData, smtp_pass: e.target.value })}
                                    placeholder='Enter password or application key'
                                    className='admin-input pr-12'
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-4 top-1/2 -translate-y-1/2 text-grey-muted hover:text-grey-dark transition-colors'
                                >
                                    <Icon icon={showPassword ? 'solar:eye-closed-bold' : 'solar:eye-bold'} className='text-lg' />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='border-t border-grey/10 pt-6'>
                        <h2 className='text-base font-bold text-grey-dark mb-4 flex items-center gap-2'>
                            <Icon icon='solar:user-id-bold-duotone' className='text-primary text-xl' />
                            Sender Identity &amp; Routing
                        </h2>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {/* Sender Name */}
                            <div>
                                <label className='admin-label'>Sender Display Name</label>
                                <input
                                    type='text'
                                    value={formData.smtp_from_name}
                                    onChange={(e) => setFormData({ ...formData, smtp_from_name: e.target.value })}
                                    placeholder="Chef's Kitchen"
                                    className='admin-input'
                                />
                            </div>

                            {/* Sender Email */}
                            <div>
                                <label className='admin-label'>From Email Address</label>
                                <input
                                    type='email'
                                    value={formData.smtp_from_email}
                                    onChange={(e) => setFormData({ ...formData, smtp_from_email: e.target.value })}
                                    placeholder='support@rythmtechnical.com'
                                    className='admin-input'
                                />
                            </div>

                            {/* Admin Notification Receiver */}
                            <div className='md:col-span-2'>
                                <label className='admin-label'>Admin Notification Receiver</label>
                                <input
                                    type='email'
                                    value={formData.admin_notification_email}
                                    onChange={(e) => setFormData({ ...formData, admin_notification_email: e.target.value })}
                                    placeholder='support@rythmtechnical.com'
                                    className='admin-input'
                                />
                                <p className='text-xs text-grey-muted mt-1.5'>
                                    Contact Form inquiries and order alerts will be forwarded to this email address.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-end pt-4 border-t border-grey/10'>
                        <button
                            type='submit'
                            disabled={saveMutation.isPending}
                            className='admin-btn-primary'
                        >
                            {saveMutation.isPending ? (
                                <>
                                    <Icon icon='line-md:loading-loop' className='text-xl' />
                                    <span>Saving Settings...</span>
                                </>
                            ) : (
                                <>
                                    <Icon icon='solar:diskette-bold-duotone' className='text-xl' />
                                    <span>Save Email Settings</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Test Email Panel */}
                <div className='space-y-6'>
                    <div className='bg-white p-6 sm:p-8 rounded-3xl border border-grey/10 shadow-sm space-y-6'>
                        <div className='flex items-center gap-3 border-b border-grey/10 pb-4'>
                            <div className='w-10 h-10 bg-green-500/10 text-green-600 rounded-xl flex items-center justify-center text-xl'>
                                <Icon icon='solar:plain-bold-duotone' />
                            </div>
                            <div>
                                <h3 className='font-bold text-grey-dark text-base'>Live Email Test</h3>
                                <p className='text-xs text-grey-muted'>Verify SMTP connection</p>
                            </div>
                        </div>

                        <p className='text-grey-muted text-xs leading-relaxed'>
                            Send a real test email to check if your credentials can authenticate with your mail server and reach customer inboxes.
                        </p>

                        <div>
                            <label className='admin-label'>Test Recipient Email</label>
                            <input
                                type='email'
                                value={testRecipient}
                                onChange={(e) => setTestRecipient(e.target.value)}
                                placeholder='your-personal-email@gmail.com'
                                className='admin-input'
                            />
                        </div>

                        <button
                            type='button'
                            disabled={testing}
                            onClick={handleTestEmail}
                            className='w-full py-3.5 bg-grey-dark hover:bg-black text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-sm disabled:opacity-50 cursor-pointer'
                        >
                            {testing ? (
                                <>
                                    <Icon icon='line-md:loading-loop' className='text-lg' />
                                    <span>Verifying &amp; Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Icon icon='solar:plain-bold' className='text-lg' />
                                    <span>Send Test Email</span>
                                </>
                            )}
                        </button>

                        {/* Test Status Feedback */}
                        {testResult && (
                            <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed border ${
                                testResult.type === 'success'
                                    ? 'bg-green-50 text-green-800 border-green-200'
                                    : 'bg-red-50 text-red-800 border-red-200'
                            }`}>
                                <div className='flex items-start gap-2'>
                                    <Icon
                                        icon={testResult.type === 'success' ? 'solar:check-circle-bold' : 'solar:danger-circle-bold'}
                                        className='text-base shrink-0 mt-0.5'
                                    />
                                    <div>{testResult.message}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Email Features Notice */}
                    <div className='bg-primary/10 border border-primary/20 p-6 rounded-3xl space-y-3'>
                        <h4 className='font-bold text-grey-dark text-sm flex items-center gap-2'>
                            <Icon icon='solar:bell-bing-bold-duotone' className='text-primary text-lg' />
                            Automated Mail Dispatchers
                        </h4>
                        <ul className='text-xs text-grey-muted space-y-2 leading-relaxed'>
                            <li className='flex items-center gap-2'>
                                <Icon icon='solar:check-read-bold' className='text-primary' />
                                <strong>Newsletter:</strong> Welcome email with menu links
                            </li>
                            <li className='flex items-center gap-2'>
                                <Icon icon='solar:check-read-bold' className='text-primary' />
                                <strong>Contact Us:</strong> Forward inquiry to admin &amp; user
                            </li>
                            <li className='flex items-center gap-2'>
                                <Icon icon='solar:check-read-bold' className='text-primary' />
                                <strong>Orders:</strong> Immediate checkout invoice receipt
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
