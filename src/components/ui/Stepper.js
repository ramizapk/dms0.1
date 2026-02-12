'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useI18n } from '@/i18n/provider';

export default function Stepper({ steps, currentStep }) {
    const { isRTL } = useI18n();

    return (
        <div className="w-full py-6" dir="ltr">
            <div className={`flex items-center justify-between relative ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className={`absolute top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.5)] ${isRTL ? 'right-0' : 'left-0'}`}
                    />
                </div>

                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;

                    return (
                        <div key={index} className="relative z-10 flex flex-col items-center gap-3">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.2 : 1,
                                    backgroundColor: isCompleted || isActive ? '#ffffff' : '#f1f5f9',
                                    borderColor: isCompleted || isActive ? 'transparent' : '#e2e8f0',
                                }}
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 
                                    transition-all duration-300 shadow-xl
                                    ${isCompleted || isActive ? 'bg-white' : 'bg-slate-100'}
                                `}
                            >
                                {isCompleted ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                                    >
                                        <Check className="w-5 h-5 text-white stroke-[3]" />
                                    </motion.div>
                                ) : isActive ? (
                                    <motion.div
                                        layoutId="activeStep"
                                        className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40 border-4 border-white"
                                    >
                                        <span className="text-white font-bold text-sm">{index + 1}</span>
                                    </motion.div>
                                ) : (
                                    <span className="text-slate-400 font-bold text-sm">{index + 1}</span>
                                )}
                            </motion.div>

                            <div className="absolute top-14 w-32 text-center">
                                <p className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-indigo-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {step.label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
