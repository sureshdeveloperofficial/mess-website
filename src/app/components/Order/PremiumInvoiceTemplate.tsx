'use client'

import React from 'react'
import { Icon } from '@iconify/react'
import { Order } from '@/app/types/order'

interface PremiumInvoiceTemplateProps {
    order: Order
    invoiceRef?: React.RefObject<HTMLDivElement | null>
}

export const PremiumInvoiceTemplate: React.FC<PremiumInvoiceTemplateProps> = ({ order, invoiceRef }) => {
    const invoiceNumber = order.id.slice(-8).toUpperCase()
    const issueDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
    })
    const total = order.totalAmount

    return (
        <div
            ref={invoiceRef}
            style={{
                width: '210mm',
                minHeight: '297mm',
                backgroundColor: '#ffffff',
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                color: '#1a1a2e',
                margin: '0 auto',
                position: 'relative',
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}
        >
            {/* Top accent bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 40%, #e8b84b 100%)',
            }} />

            {/* Main content */}
            <div style={{ padding: '48px 56px 40px 56px' }}>

                {/* ── HEADER ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #e8b84b, #f5d78e)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <Icon icon="solar:chef-hat-heart-bold" style={{ fontSize: '26px', color: '#1a1a2e' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', color: '#1a1a2e', lineHeight: 1 }}>
                                    Al Shamil
                                </div>
                                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.15em', color: '#e8b84b', textTransform: 'uppercase', marginTop: '4px' }}>
                                    Premium Kitchen Services
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
                            <Icon icon="solar:map-point-bold" style={{ fontSize: '13px', color: '#9ca3af' }} />
                            <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                                International City, Phase 1, Dubai, UAE
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                            <Icon icon="solar:phone-bold" style={{ fontSize: '13px', color: '#9ca3af' }} />
                            <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                                +971 4 264 2613
                            </span>
                        </div>
                    </div>

                    {/* Invoice Meta */}
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '32px', fontWeight: 900, color: '#1a1a2e', letterSpacing: '-1px', lineHeight: 1 }}>
                            INVOICE
                        </div>
                        <div style={{
                            display: 'inline-block',
                            marginTop: '10px',
                            padding: '6px 16px',
                            borderRadius: '100px',
                            background: '#fef9ec',
                            border: '1.5px solid #e8b84b',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#b8860b',
                            letterSpacing: '0.05em',
                        }}>
                            # {invoiceNumber}
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '11px' }}>
                                <span style={{ color: '#9ca3af', fontWeight: 500 }}>Issued</span>
                                <span style={{ color: '#374151', fontWeight: 600 }}>{issueDate}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '11px' }}>
                                <span style={{ color: '#9ca3af', fontWeight: 500 }}>Status</span>
                                <span style={{
                                    fontWeight: 700,
                                    color: order.paymentStatus === 'PAID' ? '#059669' : '#d97706',
                                }}>
                                    {order.paymentStatus === 'PAID' ? '✓ PAID' : '⏳ PENDING'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── DIVIDER ── */}
                <div style={{ height: '1px', background: '#f0f0f0', marginBottom: '40px' }} />

                {/* ── BILL TO / DELIVER TO ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                    {/* Bill To */}
                    <div>
                        <div style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: '#9ca3af',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}>
                            <div style={{ width: '16px', height: '2px', backgroundColor: '#e8b84b', borderRadius: '1px' }} />
                            Billed To
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>
                            {order.customer?.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 400, marginBottom: '4px' }}>
                            {order.customer?.email}
                        </div>
                    </div>

                    {/* Deliver To */}
                    <div>
                        <div style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: '#9ca3af',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}>
                            <div style={{ width: '16px', height: '2px', backgroundColor: '#e8b84b', borderRadius: '1px' }} />
                            Delivery Address
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            {order.buildingName ? `${order.buildingName}, ` : ''}Unit {order.flatRoomNumber || 'N/A'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 400, lineHeight: 1.6, maxWidth: '200px' }}>
                            {order.address}
                        </div>
                    </div>
                </div>

                {/* ── LINE ITEMS TABLE ── */}
                <div style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    marginBottom: '32px',
                }}>
                    {/* Table Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 100px 100px 120px',
                        background: '#1a1a2e',
                        padding: '14px 20px',
                        gap: '10px',
                    }}>
                        {['Service / Description', 'Cycles', 'Rate', 'Amount'].map((h, i) => (
                            <div key={h} style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                color: i === 3 ? '#e8b84b' : '#9ca3af',
                                textAlign: i > 1 ? 'right' : 'left',
                            }}>
                                {h}
                            </div>
                        ))}
                    </div>

                    {/* Row */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 100px 100px 120px',
                        padding: '20px 20px',
                        gap: '10px',
                        background: '#ffffff',
                        borderTop: '1px solid #f3f4f6',
                        alignItems: 'center',
                    }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>
                                Monthly Meal Plan Subscription
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['Home Delivery', 'Daily Meals', 'Premium Menu'].map(tag => (
                                    <span key={tag} style={{
                                        fontSize: '9px',
                                        fontWeight: 600,
                                        padding: '3px 10px',
                                        borderRadius: '100px',
                                        background: '#fef9ec',
                                        color: '#b8860b',
                                        border: '1px solid #f0d080',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', textAlign: 'right' }}>
                            {order.activeDates.length}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', textAlign: 'right' }}>
                            AED {order.activeDates.length > 0 ? (total / order.activeDates.length).toFixed(2) : total.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', textAlign: 'right' }}>
                            AED {total.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* ── TOTALS ── */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
                    <div style={{ width: '320px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Subtotal</span>
                            <span style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>AED {total.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Tax (0%)</span>
                            <span style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>AED 0.00</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '18px 20px',
                            marginTop: '12px',
                            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                            borderRadius: '12px',
                        }}>
                            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Total Due</span>
                            <span style={{ fontSize: '24px', fontWeight: 900, color: '#e8b84b', letterSpacing: '-0.5px' }}>
                                AED {total.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── NOTES & VERIFICATION ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
                    {/* Reference */}
                    <div style={{
                        padding: '20px',
                        background: '#f9fafb',
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb',
                    }}>
                        <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '10px' }}>
                            Reference ID
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#374151', wordBreak: 'break-all', lineHeight: 1.8 }}>
                            {order.id}
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div style={{
                        padding: '20px',
                        background: '#f9fafb',
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb',
                    }}>
                        <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '10px' }}>
                            Payment Verification
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Icon icon="solar:shield-check-bold" style={{ fontSize: '18px', color: order.paymentStatus === 'PAID' ? '#059669' : '#e8b84b' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: order.paymentStatus === 'PAID' ? '#059669' : '#d97706' }}>
                                {order.paymentStatus === 'PAID' ? 'Payment Received & Verified' : 'Payment Pending Confirmation'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>
                            Al Shamil Mess Services
                        </div>
                        <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                            alshamilmess.com · +971 4 264 2613
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '9px', color: '#d1d5db', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Electronically Generated · No Signature Required
                        </div>
                        <div style={{ fontSize: '9px', color: '#d1d5db', marginTop: '3px' }}>
                            Est. 2024
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom accent bar */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #e8b84b 0%, #1a1a2e 100%)',
            }} />

            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                @page { size: A4; margin: 0; }
                body { margin: 0; padding: 0; background: #ffffff; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            `}} />
        </div>
    )
}
