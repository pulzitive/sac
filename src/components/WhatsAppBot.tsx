import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Send,
  UserRound,
  X,
} from 'lucide-react';
import { ActivePage } from './Navbar';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  actionLabel?: string;
  actionPage?: ActivePage;
  showHumanHandoff?: boolean;
}

interface FaqItem {
  id: string;
  label: string;
  keywords: string[];
  answer: string;
  actionLabel?: string;
  actionPage?: ActivePage;
}

interface WhatsAppBotProps {
  onNavigate: (page: ActivePage, sectionId?: string) => void;
  onOpenBriefModal: () => void;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'services',
    label: 'Agency Services',
    keywords: ['service', 'services', 'offer', 'branding', 'marketing', 'media', 'production', 'ui', 'ux', 'design'],
    answer:
      'Pulzitive delivers four core services: (1) Brand Identity & Logofolio Systems, (2) Digital Marketing & OOH Campaigns, (3) Commercial Media Production, Motion & 3D, and (4) Fintech & Consumer UI/UX Flagships.',
    actionLabel: 'Explore Capabilities',
    actionPage: 'home',
  },
  {
    id: 'academy-pricing',
    label: 'Academy Naira Pricing',
    keywords: ['academy', 'cohort', 'price', 'pricing', 'cost', 'naira', 'tuition', 'fee', 'how much', 'installment', 'school', 'learn', 'training'],
    answer:
      'Pulzitive Academy Cohort 06 offers reduced, accessible Naira tuition with 2-part installments: Full-Time Studio Immersion (12 weeks) is ₦95,000 (₦47,500 deposit) and Executive Weekend Cohort is ₦65,000 (₦32,500 deposit).',
    actionLabel: 'View Academy & Apply',
    actionPage: 'academy',
  },
  {
    id: 'project-rates',
    label: 'Project Budgets & Timelines',
    keywords: ['budget', 'quote', 'project', 'rate', 'timeline', 'long', 'weeks', 'logo', 'rebrand', 'website', 'cost'],
    answer:
      'Brand identity & digital product engagements typically span 2 to 6 weeks across reduced Nigerian Naira tiers from ₦250,000 – ₦4,000,000+ (50% off standard agency rates) depending on scope (Identity, Media Production, Campaign Rollout, or UI/UX Flagship).',
  },
  {
    id: 'portfolio',
    label: 'View Client Portfolio',
    keywords: ['portfolio', 'work', 'clients', 'examples', 'vavadi', 'sofri', 'access', 'omagbada', 'drive', 'samples'],
    answer:
      'Our archive includes work for VAVADI® Watches, Access Bank (via DisruptDNA), Sofri Fintech, OMAGBADA by Omawumi, LA LUNE, FruitHaven™, Kadajo, and 18+ commercial media reels.',
    actionLabel: 'Open Portfolio Page',
    actionPage: 'portfolio',
  },
  {
    id: 'location-hours',
    label: 'Location & Hours',
    keywords: ['where', 'location', 'lagos', 'office', 'address', 'hours', 'time', 'remote', 'london', 'contact'],
    answer:
      'Our studio operates out of Lagos, Nigeria (Mon–Fri, 9:00 AM – 6:00 PM WAT) and partners remotely with clients globally. Inquiries receive a response within 24 business hours.',
  },
];

function getNowTime() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function WhatsAppBot({
  onNavigate,
  onOpenBriefModal,
}: WhatsAppBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [humanMode, setHumanMode] = useState(false);
  const [humanName, setHumanName] = useState('');
  const [humanPhone, setHumanPhone] = useState('');
  const [humanNote, setHumanNote] = useState('');
  const [humanError, setHumanError] = useState('');
  const [humanSubmitted, setHumanSubmitted] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Welcome to Pulzitive WhatsApp Business Desk. Select an FAQ below, type your question, or connect directly with a human creative producer.',
      time: getNowTime(),
    },
  ]);

  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, humanMode, humanSubmitted]);

  const appendFaqReply = (faq: FaqItem, userPrompt?: string) => {
    const now = getNowTime();
    setHumanMode(false);
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: userPrompt || faq.label,
        time: now,
      },
      {
        id: `b-${Date.now() + 1}`,
        sender: 'bot',
        text: faq.answer,
        time: now,
        actionLabel: faq.actionLabel,
        actionPage: faq.actionPage,
        showHumanHandoff: true,
      },
    ]);
  };

  const handleSendQuery = (e: FormEvent) => {
    e.preventDefault();
    const query = inputText.trim();
    if (!query) return;
    setInputText('');

    const lower = query.toLowerCase();
    if (
      lower.includes('human') ||
      lower.includes('agent') ||
      lower.includes('person') ||
      lower.includes('speak') ||
      lower.includes('call') ||
      lower.includes('salami')
    ) {
      const now = getNowTime();
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, sender: 'user', text: query, time: now },
        {
          id: `b-${Date.now() + 1}`,
          sender: 'bot',
          text: 'Connecting you to our human producer desk. Fill in your WhatsApp number below for an immediate callback, or launch WhatsApp directly.',
          time: now,
          showHumanHandoff: true,
        },
      ]);
      setHumanMode(true);
      return;
    }

    const matched = FAQ_ITEMS.find((item) =>
      item.keywords.some((kw) => lower.includes(kw))
    );

    if (matched) {
      appendFaqReply(matched, query);
    } else {
      const now = getNowTime();
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, sender: 'user', text: query, time: now },
        {
          id: `b-${Date.now() + 1}`,
          sender: 'bot',
          text: 'Thanks for reaching out to Pulzitive! Tap one of the quick FAQ topics below for instant details, or choose "Chat with Human" to speak directly with our team.',
          time: now,
          showHumanHandoff: true,
        },
      ]);
    }
  };

  const handleActivateHumanChat = () => {
    const now = getNowTime();
    setHumanSubmitted(false);
    setHumanError('');
    setHumanMode(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: 'I would like to chat with a human.',
        time: now,
      },
      {
        id: `b-${Date.now() + 1}`,
        sender: 'bot',
        text: 'Our Lagos creative desk is available to assist you directly. Share your WhatsApp contact below or open WhatsApp to start a live thread.',
        time: now,
      },
    ]);
  };

  const handleHumanSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!humanName.trim() || !humanPhone.trim()) {
      setHumanError('Please enter both your name and WhatsApp phone number.');
      return;
    }
    setHumanError('');
    setHumanSubmitted(true);
    const now = getNowTime();
    setMessages((prev) => [
      ...prev,
      {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: `Handoff confirmed for ${humanName} (${humanPhone}). A Pulzitive producer will message you on WhatsApp shortly.`,
        time: now,
      },
    ]);
  };

  return (
    <div className="fixed right-5 bottom-5 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Pulzitive WhatsApp Business Assistant"
          className="mb-3 flex max-h-[82vh] w-[calc(100vw-2.5rem)] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-[#E5E3DD] bg-[#F8F7F4] shadow-2xl"
        >
          {/* Magenta Business Bot Header */}
          <div className="flex items-center justify-between gap-3 bg-[#C026D3] px-5 py-4 text-white">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <MessageCircle className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-display text-sm font-semibold">
                  Pulzitive WhatsApp Desk
                </div>
                <div className="text-xs text-white/85">
                  Instant FAQs · Human Handoff
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleActivateHumanChat}
                className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white hover:text-[#A21CAF] whitespace-nowrap cursor-pointer"
              >
                <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Human</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close WhatsApp assistant"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/15 cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Message Feed */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-[#F1EFEA] p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#C026D3] text-white'
                      : 'border border-[#E5E3DD] bg-white text-[#111113]'
                  }`}
                >
                  <p>{msg.text}</p>

                  {msg.actionLabel && msg.actionPage && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onNavigate(
                          msg.actionPage!,
                          msg.actionPage === 'home' ? 'capabilities' : undefined
                        );
                      }}
                      className="mt-2.5 inline-flex items-center gap-1 font-semibold text-[#A21CAF] hover:underline cursor-pointer"
                    >
                      <span>{msg.actionLabel}</span>
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                  )}

                  {msg.showHumanHandoff && !humanMode && (
                    <div className="mt-2.5 border-t border-[#F1EFEA] pt-2">
                      <button
                        type="button"
                        onClick={handleActivateHumanChat}
                        className="inline-flex items-center gap-1.5 font-medium text-[#A21CAF] hover:underline cursor-pointer"
                      >
                        <UserRound className="h-3 w-3" aria-hidden="true" />
                        <span>Chat with a Human instead</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="mt-1 px-1 font-mono text-[10px] text-[#71717A] tabular-nums">
                  {msg.time}
                </span>
              </div>
            ))}

            {/* Human Handoff Card */}
            {humanMode && (
              <div className="rounded-xl border border-[#E5E3DD] bg-white p-4">
                <div className="flex items-center justify-between gap-2 border-b border-[#F1EFEA] pb-2.5">
                  <span className="font-display text-xs font-semibold text-[#111113]">
                    Connect to Human Producer
                  </span>
                  <button
                    type="button"
                    onClick={() => setHumanMode(false)}
                    className="text-[11px] text-[#71717A] hover:text-[#111113] cursor-pointer"
                  >
                    Back to FAQs
                  </button>
                </div>

                {humanSubmitted ? (
                  <div className="mt-3 space-y-2 text-xs text-[#15803D]">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>WhatsApp Callback Queued</span>
                    </div>
                    <p className="text-[#52525B]">
                      Thank you, {humanName}. Our human desk has your WhatsApp
                      number ({humanPhone}).
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleHumanSubmit} className="mt-3 space-y-2.5">
                    {humanError && (
                      <p className="text-[11px] font-medium text-red-700">
                        {humanError}
                      </p>
                    )}
                    <input
                      type="text"
                      value={humanName}
                      onChange={(e) => setHumanName(e.target.value)}
                      placeholder="Your Name"
                      aria-label="Your Name"
                      className="w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3 py-2 text-xs text-[#111113] focus:border-[#C026D3] focus:bg-white focus:outline-none"
                    />
                    <input
                      type="tel"
                      value={humanPhone}
                      onChange={(e) => setHumanPhone(e.target.value)}
                      placeholder="WhatsApp Number (e.g. +234 80...)"
                      aria-label="WhatsApp Number"
                      className="w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3 py-2 text-xs text-[#111113] tabular-nums focus:border-[#C026D3] focus:bg-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={humanNote}
                      onChange={(e) => setHumanNote(e.target.value)}
                      placeholder="Topic (Branding, Academy, Media...)"
                      aria-label="Topic"
                      className="w-full rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3 py-2 text-xs text-[#111113] focus:border-[#C026D3] focus:bg-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-[#C026D3] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#A21CAF] cursor-pointer"
                    >
                      Request Live WhatsApp Reply
                    </button>
                  </form>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#F1EFEA] pt-3 text-[11px]">
                  <a
                    href="https://wa.me/?text=Hello%20Pulzitive%20Agency%2C%20I%20would%20like%20to%20speak%20with%20your%20team."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#A21CAF] hover:underline"
                  >
                    Open WhatsApp App
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenBriefModal();
                    }}
                    className="font-medium text-[#52525B] hover:text-[#111113] cursor-pointer"
                  >
                    Submit Full Brief
                  </button>
                </div>
              </div>
            )}

            <div ref={scrollEndRef} />
          </div>

          {/* Quick FAQ Prompts */}
          <div className="border-t border-[#E5E3DD] bg-white px-3 py-2.5">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {FAQ_ITEMS.map((faq) => (
                <button
                  key={faq.id}
                  type="button"
                  onClick={() => appendFaqReply(faq)}
                  className="rounded-lg border border-[#E5E3DD] bg-[#F8F7F4] px-2.5 py-1.5 text-[11px] font-medium text-[#111113] transition-colors hover:border-[#C026D3] hover:text-[#A21CAF] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {faq.label}
                </button>
              ))}
              <button
                type="button"
                onClick={handleActivateHumanChat}
                className="rounded-lg bg-[#C026D3]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#A21CAF] transition-colors hover:bg-[#C026D3] hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                Chat with Human
              </button>
            </div>

            {/* Text Input */}
            <form
              onSubmit={handleSendQuery}
              className="mt-2 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about pricing, cohorts, services..."
                aria-label="Ask Pulzitive WhatsApp Bot"
                className="flex-1 rounded-lg border border-[#D4D2CA] bg-[#F8F7F4] px-3 py-2 text-xs text-[#111113] focus:border-[#C026D3] focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#C026D3] text-white transition-colors hover:bg-[#A21CAF] cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Magenta Floating Launcher */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close WhatsApp Business chat' : 'Open WhatsApp Business chat'}
        aria-expanded={isOpen}
        className="inline-flex h-14 items-center gap-2.5 rounded-full bg-[#C026D3] px-5 text-sm font-medium text-white shadow-lg transition-transform duration-150 hover:scale-[1.03] hover:bg-[#A21CAF] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C026D3]"
      >
        {isOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        )}
        <span className="whitespace-nowrap">
          {isOpen ? 'Close Chat' : 'WhatsApp Desk'}
        </span>
      </button>
    </div>
  );
}
