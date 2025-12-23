import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiQuestionMarkCircle, HiChevronDown, HiChevronUp } from 'react-icons/hi';

const faqs = [
    {
        category: 'General',
        items: [
            {
                q: 'What is PromoSecure?',
                a: 'PromoSecure is a privacy-focused promotional verification platform that allows on-field promoters to securely capture and submit photos with the public as proof of their promotional work, while automatically protecting public privacy through AI face blurring.'
            },
            {
                q: 'How does face blurring work?',
                a: 'Our AI uses TensorFlow.js with MediaPipe Face Detector to automatically detect all faces in a photo. The blur process includes 4 layers: heavy pixelation, multiple Gaussian blur passes, noise overlay, and final pixelation. This happens entirely on your device before upload.'
            },
            {
                q: 'Is the public\'s privacy protected?',
                a: 'Yes, absolutely. Faces are heavily blurred before photos leave the promoter\'s device. Managers only see the blurred versions. The original photos with visible faces are only accessible to the promoter during capture.'
            },
        ]
    },
    {
        category: 'For Promoters',
        items: [
            {
                q: 'How do I create a batch?',
                a: 'Click "New Batch" on your dashboard, enter the batch title, optional description, and location. Then click "Create & Start Capturing" to begin adding photos.'
            },
            {
                q: 'What if no face is detected?',
                a: 'The AI requires at least one face to be visible in the photo. Ensure the person is facing the camera and has adequate lighting. The app will alert you if no face is detected.'
            },
            {
                q: 'What happens if I take a duplicate photo?',
                a: 'The AI compares each new photo against existing photos in the batch. If it detects a potential duplicate (similar face or identical image), you\'ll see a warning. You can still add it if needed.'
            },
            {
                q: 'Can I delete photos after submission?',
                a: 'No, once a batch is submitted for review, photos cannot be deleted or modified. Make sure all photos are correct before submitting.'
            },
        ]
    },
    {
        category: 'For Managers',
        items: [
            {
                q: 'How do I add promoters?',
                a: 'Go to "Promoters" in your dashboard and click "Add Promoter". Enter their name, email, and a password. Note: You have a limit on how many promoters you can create based on your subscription.'
            },
            {
                q: 'Can I see the original unblurred photos?',
                a: 'No, for privacy reasons, managers can only see the blurred versions. The AI verification summary provides confidence that photos are legitimate and of unique individuals.'
            },
            {
                q: 'What does the AI verification score mean?',
                a: 'The verification score indicates the percentage of unique individuals detected. A score of 100% means all photos show different people. Lower scores indicate potential duplicates.'
            },
        ]
    },
    {
        category: 'Technical',
        items: [
            {
                q: 'How much storage does PromoSecure use?',
                a: 'MongoDB Atlas free tier provides 512MB storage. With average photo size of ~100KB (compressed), this allows approximately 2,500-5,000 photos. For larger needs, upgrade your MongoDB plan.'
            },
            {
                q: 'Is there a usage limit?',
                a: 'Free tier limits: 100 API requests per 15 minutes, 5 login attempts per 15 minutes, 30 photo uploads per hour. These limits help prevent abuse while allowing normal usage.'
            },
            {
                q: 'What browsers are supported?',
                a: 'PromoSecure works best on Chrome, Edge, and Firefox. Safari has limited WebGL support which may affect AI performance. For best experience, use Chrome on mobile devices.'
            },
        ]
    },
];

const Help = () => {
    const navigate = useNavigate();
    const [openItems, setOpenItems] = useState({});

    const toggleItem = (categoryIndex, itemIndex) => {
        const key = `${categoryIndex}-${itemIndex}`;
        setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="page help-page">
            <button className="btn btn-ghost mb-3" onClick={() => navigate(-1)}>
                <HiArrowLeft /> Back
            </button>

            <div className="help-header">
                <div className="help-icon">
                    <HiQuestionMarkCircle />
                </div>
                <h1>Help & FAQ</h1>
                <p className="text-muted">Find answers to common questions</p>
            </div>

            <div className="faq-container">
                {faqs.map((category, catIndex) => (
                    <div key={category.category} className="faq-category">
                        <h2 className="category-title">{category.category}</h2>
                        <div className="faq-list">
                            {category.items.map((item, itemIndex) => {
                                const key = `${catIndex}-${itemIndex}`;
                                const isOpen = openItems[key];
                                return (
                                    <div key={itemIndex} className={`faq-item ${isOpen ? 'open' : ''}`}>
                                        <button
                                            className="faq-question"
                                            onClick={() => toggleItem(catIndex, itemIndex)}
                                        >
                                            <span>{item.q}</span>
                                            {isOpen ? <HiChevronUp /> : <HiChevronDown />}
                                        </button>
                                        {isOpen && (
                                            <div className="faq-answer">
                                                <p>{item.a}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="help-contact card mt-3">
                <h3>Still need help?</h3>
                <p className="text-muted">Contact your system administrator or manager for additional support.</p>
            </div>

            <style>{`
        .help-page {
          max-width: 900px;
        }

        .help-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .help-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: var(--brand-gradient);
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: white;
          box-shadow: var(--shadow-glow);
        }

        .help-header h1 {
          margin-bottom: 0.5rem;
        }

        .faq-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .category-title {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          padding-left: 0.5rem;
          border-left: 3px solid var(--brand-primary);
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .faq-item {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all var(--transition-fast);
        }

        .faq-item.open {
          border-color: var(--border-hover);
        }

        .faq-question {
          width: 100%;
          padding: 1.25rem;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .faq-question:hover {
          color: var(--brand-primary);
        }

        .faq-question svg {
          font-size: 1.25rem;
          flex-shrink: 0;
          color: var(--text-muted);
        }

        .faq-answer {
          padding: 0 1.25rem 1.25rem;
          animation: slideDown 0.2s ease;
        }

        .faq-answer p {
          line-height: 1.7;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .help-contact {
          text-align: center;
        }

        .help-contact h3 {
          margin-bottom: 0.5rem;
        }
      `}</style>
        </div>
    );
};

export default Help;
