import { ArrowRight, MapPin, MessageSquare, PhoneCall } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { ContactCard } from '@/lib/contact-info';

const cardIcons: Record<ContactCard['icon'], typeof MapPin> = {
    pin: MapPin,
    phone: PhoneCall,
    message: MessageSquare,
};

/**
 * The resolved contact cards. The `card` variant is the three-up grid used by
 * the contact and about pages; `row` is the compact list used inside a page
 * block. Both render the same managed data.
 */
export function ContactCards({
    cards,
    variant = 'card',
}: {
    cards: ContactCard[];
    variant?: 'card' | 'row';
}) {
    if (variant === 'row') {
        return (
            <div className="grid gap-3 sm:grid-cols-1">
                {cards.map((card) => {
                    const Icon = cardIcons[card.icon];

                    return (
                        <div key={card.title} className="rounded-lg border border-fmca-ink/10 bg-fmca-mist/50 p-4">
                            <div className="flex items-center gap-2.5">
                                <Icon size={18} className="text-fmca-teal" aria-hidden="true" />
                                <h3 className="text-sm font-bold text-fmca-ink">{card.title}</h3>
                            </div>
                            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{card.description.join(' ')}</p>
                            <a
                                href={card.href}
                                {...(card.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                                className="mt-2 inline-block text-xs font-bold text-fmca-green hover:text-fmca-green-dark"
                            >
                                {card.hrefLabel}
                            </a>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
                const Icon = cardIcons[card.icon];

                return (
                    <Card
                        key={card.title}
                        className="flex flex-col justify-between rounded-2xl border border-fmca-ink/10 bg-white p-6 shadow-xs"
                    >
                        <div>
                            <span className="flex size-11 items-center justify-center rounded-lg bg-fmca-mist text-fmca-green">
                                <Icon size={22} aria-hidden="true" />
                            </span>
                            <h2 className="mt-4 font-display text-lg font-bold text-fmca-green-dark">{card.title}</h2>
                            <div className="mt-2 text-sm leading-relaxed text-slate-600">
                                {card.description.map((line) => (
                                    <p key={line} className="leading-relaxed">
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                        <a
                            href={card.href}
                            {...(card.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-fmca-green hover:text-fmca-green-dark"
                        >
                            <span>{card.hrefLabel}</span>
                            <ArrowRight size={16} aria-hidden="true" />
                        </a>
                    </Card>
                );
            })}
        </div>
    );
}
