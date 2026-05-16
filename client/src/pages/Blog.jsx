import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft, HiClock, HiUser, HiArrowRight, HiSearch, HiTag, HiCalendar, HiBookOpen, HiChatAlt2, HiCheckCircle, HiShare } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Blog = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [email, setEmail] = useState('');
    
    // Anti-Bot Comment System State
    const [comments, setComments] = useState({
        1: [
            { id: 1, name: 'Sarah Jenkins', date: '2026-02-06', text: 'This heat map feature is exactly what our agency has been waiting for. Great update!' },
            { id: 2, name: 'David Chen', date: '2026-02-08', text: 'Will the week-over-week comparisons be exportable to PDF for client reporting?' }
        ]
    });
    const [newComment, setNewComment] = useState('');
    const [commentName, setCommentName] = useState('');
    const [honeypot, setHoneypot] = useState(''); // Bot trap
    const [mathCaptcha, setMathCaptcha] = useState({ num1: 0, num2: 0, answer: '' });

    useEffect(() => {
        generateCaptcha();
        window.scrollTo(0, 0);
    }, [selectedArticle]);

    const generateCaptcha = () => {
        setMathCaptcha({
            num1: Math.floor(Math.random() * 10) + 1,
            num2: Math.floor(Math.random() * 10) + 1,
            answer: ''
        });
    };

    const categories = ['all', 'Product Updates', 'Industry Insights', 'Best Practices', 'Case Studies'];

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        
        // 1. Honeypot check (Bots often fill out all fields indiscriminately)
        if (honeypot !== '') {
            toast.error('Bot activity detected. Request blocked.');
            return;
        }

        // 2. Math Captcha check (Simple human verification)
        const correctAnswer = mathCaptcha.num1 + mathCaptcha.num2;
        if (parseInt(mathCaptcha.answer) !== correctAnswer) {
            toast.error('Incorrect math answer. Please try again.');
            generateCaptcha(); // Reset captcha on failure
            return;
        }

        if (!commentName.trim() || !newComment.trim()) {
            toast.error('Please fill out all required fields.');
            return;
        }

        const commentObj = {
            id: Date.now(),
            name: commentName,
            date: new Date().toISOString().split('T')[0],
            text: newComment
        };

        setComments(prev => ({
            ...prev,
            [selectedArticle.id]: [...(prev[selectedArticle.id] || []), commentObj]
        }));

        toast.success('Comment posted successfully!');
        setNewComment('');
        setCommentName('');
        generateCaptcha();
    };

    const renderContent = (content) => {
        if (!content) return '';
        return content.split('\n\n').map((block, i) => {
            block = block.trim();
            if (!block) return null;
            if (block.startsWith('### ')) return `<h3 class="article-h3">${block.replace('### ', '')}</h3>`;
            if (block.startsWith('## ')) return `<h2 class="article-h2">${block.replace('## ', '')}</h2>`;
            if (block.startsWith('- ') || block.startsWith('* ')) {
                const items = block.split('\n').map(item => `<li>${item.replace(/^[-*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('');
                return `<ul class="article-ul">${items}</ul>`;
            }
            if (block.startsWith('> ')) return `<blockquote class="article-quote">${block.replace(/> /g, '').replace(/\n/g, '<br/>')}</blockquote>`;
            if (block.includes('|')) {
                const rows = block.split('\n').filter(r => r.includes('|') && !r.includes('---'));
                const tableRows = rows.map((row, idx) => {
                    const cells = row.split('|').filter(c => c.trim() !== '').map(c => `<td>${c.trim()}</td>`).join('');
                    return `<tr class="${idx === 0 ? 'table-header' : ''}">${cells}</tr>`;
                });
                return `<div class="table-wrapper"><table>${tableRows.join('')}</table></div>`;
            }
            return `<p class="article-p">${block.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}</p>`;
        }).join('');
    };

    const blogPosts = [
        {
            id: 1,
            title: 'Introducing the Advanced Analytics Dashboard: Data-Driven Campaign Management',
            excerpt: 'Unlock deeper insights into your promotional campaigns with our new analytics features including activity heat maps, week-over-week comparisons, and comprehensive promoter rankings.',
            category: 'Product Updates',
            author: 'Vignesh Kumar',
            authorRole: 'Founder, PromoSecure',
            date: '2026-02-05',
            readTime: '5 min read',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
            featured: true,
            content: `
## The Challenge of Campaign Analytics

Promotional marketing agencies have long struggled with a critical blind spot: understanding when, where, and how their field teams perform best. Traditional methods relied on spreadsheets, manual reports, and gut feelings—leading to missed opportunities and inefficient resource allocation.

That's why we built the Advanced Analytics Dashboard—a comprehensive analytics solution designed specifically for promotional campaign management.

## What's New

### Activity Heat Grid
Our new heat map visualization shows you exactly when your promoters are most active. The grid displays photo submissions by day of the week and hour, with color intensity indicating volume. This helps you:

- **Identify peak performance windows** – Know when your team captures the most content
- **Optimize scheduling** – Allocate resources to high-activity periods
- **Spot patterns** – Understand weekly rhythms in your campaigns

### Week-over-Week Comparison
Track your progress with clear trend indicators:

- **Photos this week vs. last week** – See growth or decline at a glance
- **Batch submission trends** – Monitor workflow efficiency
- **Approval rate changes** – Track quality improvements over time

### Promoter Leaderboard
Recognize your top performers and identify those who need support:

- **Ranking with medals** – Visual distinction for top 3 performers
- **Approval rates** – Quality metrics alongside quantity
- **Trend indicators** – See who's improving vs. declining

## How to Access

1. Log in as a Manager
2. Navigate to **Analytics** in the sidebar
3. Use the three tabs: **Overview**, **Activity Heatmap**, and **Trends & Insights**

## Impact on Your Business

Early beta users report:
- **35% improvement** in resource allocation efficiency
- **22% increase** in overall photo capture rates
- **Better team motivation** through transparent performance tracking

The Advanced Analytics Dashboard is available now for all Pro and Enterprise customers at no additional cost.
            `
        },
        {
            id: 2,
            title: 'How AI Face Blurring Protects Public Privacy in Promotional Photography',
            excerpt: 'A technical deep-dive into our 4-layer privacy protection system and why sophisticated face detection matters for ethical promotional campaigns.',
            category: 'Industry Insights',
            author: 'Tech Team',
            authorRole: 'Engineering',
            date: '2026-02-01',
            readTime: '7 min read',
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop',
            featured: false,
            content: `
## The Privacy Imperative

When promoters capture photos in public spaces—retail stores, events, trade shows—bystanders inevitably appear in the frame. Without proper privacy protection, these images can create legal liability and ethical concerns for your brand.

PromoSecure's AI face blurring technology addresses this challenge with a sophisticated multi-layer approach.

## Our 4-Layer Privacy Protection System

### Layer 1: Face Detection
Using advanced computer vision models trained on diverse datasets, our system identifies faces with 99.2% accuracy across varying:
- Lighting conditions
- Angles and orientations
- Partial occlusions (masks, sunglasses)
- Image quality levels

### Layer 2: Promoter Recognition
Our system distinguishes between your field team and bystanders:
- Registered promoters remain unblurred
- Only non-team member faces receive privacy protection
- Works even when promoters wear different outfits

### Layer 3: Intelligent Blur Application
Not all blur is equal. Our algorithm:
- Applies natural-looking Gaussian blur
- Maintains context while ensuring anonymity
- Adjusts intensity based on face size and prominence

### Layer 4: Quality Preservation
Privacy protection shouldn't compromise your campaign assets:
- Promotional materials remain sharp
- Product displays stay visible
- Brand elements are preserved

## Technical Specifications

| Metric | Performance |
|--------|-------------|
| Detection Accuracy | 99.2% |
| Processing Time | < 2 seconds |
| False Positive Rate | < 0.3% |
| Supported Formats | JPEG, PNG, HEIC, WebP |

## Compliance & Legal Considerations

Our privacy protection helps you comply with:
- **GDPR** (General Data Protection Regulation)
- **India's Digital Personal Data Protection Act**
- **CCPA** (California Consumer Privacy Act)
- **Various state and national privacy laws**

## Best Practices

1. **Enable auto-blurring** for all campaigns
2. **Brief promoters** on capturing quality shots
3. **Review borderline cases** in the Manager portal
4. **Document your privacy policy** for clients

Privacy-first promotional marketing isn't just ethical—it's increasingly becoming a legal requirement and competitive advantage.
            `
        },
        {
            id: 3,
            title: '10 Proven Strategies for High-Impact Promotional Photo Campaigns',
            excerpt: 'Maximize your ROI with battle-tested techniques from agencies that have captured over 100,000 photos using PromoSecure.',
            category: 'Best Practices',
            author: 'Marketing Team',
            authorRole: 'Customer Success',
            date: '2026-01-28',
            readTime: '6 min read',
            image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop',
            featured: false,
            content: `
## Introduction

After analyzing data from over 50,000 promotional campaigns, we've identified the strategies that separate high-performing agencies from the rest. Here are 10 proven tactics you can implement today.

## 1. Define Clear Photo Guidelines

Before a single photo is taken, establish:
- Required angles (front, side, close-up)
- Mandatory elements (price tags, product placement)
- Unacceptable scenarios (empty shelves, competitor products)

Share these as visual guides, not just text documents.

## 2. Implement Real-Time Feedback Loops

Don't wait for end-of-day batch reviews:
- Enable push notifications for immediate feedback
- Use the messaging system for quick corrections
- Celebrate good work publicly in team chats

## 3. Optimize Photo Capture Timing

Our analytics show peak quality between:
- **10 AM - 12 PM**: Best natural lighting, pre-lunch rush
- **2 PM - 4 PM**: Post-lunch, good foot traffic for context
- **Avoid**: Opening hours (stores setting up) and closing (tired staff)

## 4. Use Batch Organization Strategically

Structure your batches to tell a story:
- One batch per store visit
- Consistent naming conventions
- Include location metadata

## 5. Train Promoters on Composition

Basic photography principles make a difference:
- Rule of thirds for product placement
- Eye-level shots for shelf displays
- Include context (store signage, aisles)

## 6. Leverage the Approval Workflow

Use rejection reasons constructively:
- Be specific: "Blurry left corner" not "Bad quality"
- Track rejection patterns by promoter
- Create training content from common issues

## 7. Set Daily Targets with Flexibility

Balance accountability with realism:
- Base targets on store size/type
- Allow roll-over for scheduling issues
- Reward consistency over single-day spikes

## 8. Integrate with Your Reporting Cycle

Align photo campaigns with business rhythms:
- Weekly summaries for operations
- Monthly trend reports for clients
- Quarterly performance reviews

## 9. Build a Photo Reference Library

Create a searchable archive of excellent examples:
- Tag by product, store type, campaign
- Use for training new promoters
- Share with clients as proof of execution

## 10. Measure and Iterate

Track these KPIs monthly:
- Photos per promoter per day
- First-attempt approval rate
- Average processing time
- Client satisfaction scores

## Conclusion

These strategies aren't theoretical—they're proven in the field by agencies managing hundreds of promoters across thousands of retail locations. Start with 2-3 that address your biggest pain points, measure the impact, and expand from there.
            `
        },
        {
            id: 4,
            title: 'Case Study: How Urban Promotions Scaled from 10 to 200 Promoters',
            excerpt: 'A detailed look at how one of India\'s fastest-growing promotional agencies transformed their operations with PromoSecure.',
            category: 'Case Studies',
            author: 'Success Team',
            authorRole: 'Customer Success',
            date: '2026-01-20',
            readTime: '8 min read',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
            featured: false,
            content: `
## Company Profile

**Urban Promotions** is a Bangalore-based promotional marketing agency specializing in FMCG and retail activations. Founded in 2021, they experienced rapid growth but struggled to scale their operations efficiently.

## The Challenge

When Urban Promotions approached us, they were managing:
- 10 promoters across 3 cities
- Manual WhatsApp-based photo collection
- Excel spreadsheets for tracking
- Email-based client reporting

**Key Pain Points:**
- 4+ hours daily spent organizing photos
- Inconsistent quality across promoters
- No real-time visibility for managers
- Delayed client reporting (48-72 hours)
- Privacy compliance concerns

## The Solution

Urban Promotions implemented PromoSecure with a phased rollout:

### Phase 1: Pilot (Month 1)
- 10 existing promoters onboarded
- Basic batch workflow established
- Manager training completed

### Phase 2: Expansion (Months 2-3)
- Scaled to 50 promoters
- Implemented AI face blurring
- Established quality standards

### Phase 3: Full Deployment (Months 4-6)
- 200 promoters across 15 cities
- Advanced analytics utilization
- Client portal access

## Results

After 6 months, Urban Promotions achieved:

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Daily Admin Time | 4+ hours | 30 min | -87% |
| Photo Processing | 48-72 hrs | < 2 hrs | -97% |
| First-Submit Approval | 62% | 89% | +44% |
| Client Response Time | 2-3 days | Same day | -85% |
| Monthly Photo Volume | 2,000 | 45,000 | +2,150% |

## Key Success Factors

1. **Executive Sponsorship**: CEO championed the transformation
2. **Promoter Buy-In**: Early training and support
3. **Gradual Rollout**: Phased approach prevented overwhelm
4. **Feedback Integration**: Regular process improvements

## Quote from the CEO

> "PromoSecure didn't just improve our efficiency—it enabled our growth. We couldn't have scaled to 200 promoters with our old WhatsApp workflows. The privacy features also opened doors with enterprise clients who had strict compliance requirements."
> 
> — Rajesh Kumar, CEO, Urban Promotions

## Lessons Learned

- Start with your most tech-comfortable promoters
- Invest time in initial setup and configuration
- Use analytics to identify and address issues early
- Communicate wins to build organizational momentum

Urban Promotions is now one of India's fastest-growing promotional agencies, serving major FMCG brands across the country.
            `
        },
        {
            id: 5,
            title: 'Offline Mode: Ensuring Reliable Photo Capture in Low-Connectivity Zones',
            excerpt: 'How PromoSecure\'s offline capabilities ensure your promoters never miss a shot, even in basement retail locations or rural areas.',
            category: 'Product Updates',
            author: 'Product Team',
            authorRole: 'Product Management',
            date: '2026-01-15',
            readTime: '4 min read',
            image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop',
            featured: false,
            content: `
## The Connectivity Challenge

Promotional photography often happens in challenging environments:
- **Basement retail spaces** with poor signal
- **Rural markets** with inconsistent coverage
- **Large warehouses** with network dead zones
- **Event venues** during high-traffic periods

When your promoters can't upload photos in real-time, campaigns suffer.

## Introducing Offline Mode

Our offline capabilities ensure reliable operation regardless of connectivity:

### How It Works

1. **Local Capture**: Photos are stored securely on the device
2. **Automatic Detection**: App recognizes when offline
3. **Queue Management**: Batches organized for efficient upload
4. **Smart Sync**: Automatic upload when connectivity returns
5. **Conflict Resolution**: Handles duplicate prevention

### Key Features

**Seamless Experience**
- No change in promoter workflow
- Visual indicators for queued uploads
- Background synchronization

**Data Integrity**
- End-to-end encryption for cached photos
- Metadata preservation (timestamps, location)
- Verification of successful uploads

**Manager Visibility**
- Dashboard shows pending uploads by promoter
- Estimated sync times based on queue size
- Alerts for promoters with large backlogs

## Technical Specifications

| Feature | Specification |
|---------|---------------|
| Max Offline Storage | 1,000 photos per device |
| Auto-Sync Threshold | 50% connectivity |
| Retry Logic | Exponential backoff |
| Data Priority | Newest photos first |

## Best Practices

1. **Brief promoters** on offline indicators
2. **Encourage Wi-Fi sync** at end of day
3. **Monitor pending uploads** in dashboard
4. **Plan for offline** in schedule assignments

## Availability

Offline Mode is currently in development and scheduled for release in early 2026. Join our beta program to get early access.
            `
        }
    ];

    const filteredPosts = blogPosts.filter(post => {
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const featuredPost = blogPosts.find(p => p.featured);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email');
            return;
        }
        toast.success('Successfully subscribed! Welcome aboard.');
        setEmail('');
    };

    return (
        <div className="blog-page">
            <header className="blog-header-premium">
                <div className="blob-bg"></div>
                <div className="blog-header-nav">
                    <Link to="/" className="back-link-premium">
                        <HiArrowLeft /> Back to Home
                    </Link>
                </div>
                <div className="blog-header-content">
                    <div className="badge-premium">Our Insights</div>
                    <h1>The Future of <span>Verification.</span></h1>
                    <p>Expert perspectives, product updates, and case studies to help you scale field operations with zero-knowledge privacy.</p>
                </div>
            </header>

            {selectedArticle ? (
                <section className="article-view-premium">
                    <div className="article-container">
                        <button className="back-to-blog-btn" onClick={() => setSelectedArticle(null)}>
                            <HiArrowLeft /> Back to Articles
                        </button>
                        
                        <article className="premium-article">
                            <div className="article-hero">
                                <div className="article-hero-content">
                                    <span className="category-pill"><HiTag /> {selectedArticle.category}</span>
                                    <h1>{selectedArticle.title}</h1>
                                    <div className="meta-bar">
                                        <div className="author-block">
                                            <div className="author-avatar">{selectedArticle.author.charAt(0)}</div>
                                            <div className="author-details">
                                                <strong>{selectedArticle.author}</strong>
                                                <span>{selectedArticle.authorRole}</span>
                                            </div>
                                        </div>
                                        <div className="stats-block">
                                            <span><HiCalendar /> {new Date(selectedArticle.date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                            <span><HiBookOpen /> {selectedArticle.readTime}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="article-hero-image">
                                    <img src={selectedArticle.image} alt={selectedArticle.title} />
                                </div>
                            </div>
                            
                            <div className="article-body" dangerouslySetInnerHTML={{ __html: renderContent(selectedArticle.content) }} />
                            
                            <div className="article-sharing">
                                <h3>Share this insight</h3>
                                <div className="share-buttons">
                                    <button className="btn-share" onClick={() => toast.success('Link copied to clipboard!')}><HiShare /> Copy Link</button>
                                </div>
                            </div>
                        </article>

                        {/* Premium Comments Section with Bot Protection */}
                        <div className="comments-section">
                            <div className="comments-header">
                                <h2><HiChatAlt2 /> Discussion ({comments[selectedArticle.id]?.length || 0})</h2>
                            </div>
                            
                            <div className="comments-list">
                                {comments[selectedArticle.id]?.length > 0 ? (
                                    comments[selectedArticle.id].map(comment => (
                                        <div key={comment.id} className="comment-card">
                                            <div className="comment-avatar">{comment.name.charAt(0)}</div>
                                            <div className="comment-content">
                                                <div className="comment-meta">
                                                    <strong>{comment.name}</strong>
                                                    <span className="comment-date">{comment.date}</span>
                                                </div>
                                                <p>{comment.text}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-comments">Be the first to share your thoughts.</p>
                                )}
                            </div>

                            <form className="comment-form" onSubmit={handleCommentSubmit}>
                                <h3>Leave a Reply</h3>
                                <p className="form-subtitle">Your email address will not be published.</p>
                                
                                {/* Honeypot field - Hidden from users via CSS */}
                                <div className="hidden-field" aria-hidden="true">
                                    <input type="text" name="url" tabIndex="-1" autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                                </div>

                                <div className="input-group">
                                    <label>Display Name *</label>
                                    <input type="text" placeholder="John Doe" value={commentName} onChange={(e) => setCommentName(e.target.value)} required />
                                </div>

                                <div className="input-group">
                                    <label>Your Comment *</label>
                                    <textarea placeholder="Join the discussion..." rows="4" value={newComment} onChange={(e) => setNewComment(e.target.value)} required />
                                </div>

                                <div className="input-group bot-check">
                                    <label>Are you human? Verify to post: <strong>{mathCaptcha.num1} + {mathCaptcha.num2} = ?</strong> *</label>
                                    <input type="number" placeholder="Enter sum" value={mathCaptcha.answer} onChange={(e) => setMathCaptcha(prev => ({ ...prev, answer: e.target.value }))} required />
                                </div>

                                <button type="submit" className="btn-post-comment">Post Comment</button>
                            </form>
                        </div>
                    </div>
                </section>
            ) : (
                <>
                    <section className="search-filter-section">
                        <div className="filter-wrapper">
                            <div className="search-bar-premium">
                                <HiSearch />
                                <input 
                                    type="text" 
                                    placeholder="Search insights..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="category-pills">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`pill ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat === 'all' ? 'View All' : cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {featuredPost && selectedCategory === 'all' && !searchQuery && (
                        <section className="featured-premium">
                            <div className="featured-wrapper" onClick={() => setSelectedArticle(featuredPost)}>
                                <div className="featured-image-box">
                                    <img src={featuredPost.image} alt={featuredPost.title} />
                                    <div className="featured-tag">Featured Insight</div>
                                </div>
                                <div className="featured-info">
                                    <span className="category">{featuredPost.category}</span>
                                    <h2>{featuredPost.title}</h2>
                                    <p>{featuredPost.excerpt}</p>
                                    <div className="meta">
                                        <span><HiUser /> {featuredPost.author}</span>
                                        <span><HiClock /> {featuredPost.readTime}</span>
                                    </div>
                                    <button className="btn-read-feat">Read Full Story <HiArrowRight /></button>
                                </div>
                            </div>
                        </section>
                    )}

                    <section className="grid-premium">
                        <div className="grid-wrapper">
                            {filteredPosts.filter(p => !p.featured || selectedCategory !== 'all' || searchQuery).map((post, index) => (
                                <article
                                    key={post.id}
                                    className="premium-card"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                    onClick={() => setSelectedArticle(post)}
                                >
                                    <div className="card-img-wrap">
                                        <img src={post.image} alt={post.title} />
                                        <div className="card-category"><HiTag /> {post.category}</div>
                                    </div>
                                    <div className="card-text">
                                        <h3>{post.title}</h3>
                                        <p>{post.excerpt}</p>
                                    </div>
                                    <div className="card-footer">
                                        <div className="author-mini">
                                            <div className="av">{post.author.charAt(0)}</div>
                                            <span>{post.author}</span>
                                        </div>
                                        <span className="date">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                </article>
                            ))}
                            {filteredPosts.length === 0 && (
                                <div className="no-results-premium">
                                    <p>No insights found for your search.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="newsletter-premium">
                        <div className="newsletter-content">
                            <h2>Join 10,000+ Field Marketing Leaders</h2>
                            <p>Subscribe to our newsletter for exclusive reports and advanced verification strategies.</p>
                            <form onSubmit={handleSubscribe}>
                                <div className="subscribe-box">
                                    <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    <button type="submit">Subscribe</button>
                                </div>
                            </form>
                            <p className="privacy-note">We care about your data. Unsubscribe anytime.</p>
                        </div>
                    </section>
                </>
            )}

            <style>{`
                /* Premium Blog Styles */
                .blog-page {
                    min-height: 100vh;
                    background: #09090b;
                    color: #fafafa;
                    font-family: 'Inter', sans-serif;
                }

                .blog-header-premium {
                    position: relative;
                    padding: 4rem 2rem 6rem;
                    text-align: center;
                    background: #09090b;
                    overflow: hidden;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .blob-bg {
                    position: absolute;
                    top: -50%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 800px;
                    height: 800px;
                    background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%);
                    z-index: 0;
                    pointer-events: none;
                }

                .blog-header-nav {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: flex-start;
                    position: relative;
                    z-index: 1;
                    margin-bottom: 3rem;
                }

                .back-link-premium {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #a1a1aa;
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: color 0.3s;
                }
                .back-link-premium:hover { color: #fff; }

                .blog-header-content {
                    position: relative;
                    z-index: 1;
                    max-width: 700px;
                    margin: 0 auto;
                }

                .badge-premium {
                    display: inline-block;
                    padding: 0.4rem 1rem;
                    background: rgba(59,130,246,0.1);
                    color: #60a5fa;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    border: 1px solid rgba(59,130,246,0.2);
                }

                .blog-header-content h1 {
                    font-size: 3.5rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    line-height: 1.1;
                    margin-bottom: 1.5rem;
                }
                .blog-header-content h1 span {
                    background: linear-gradient(135deg, #60a5fa, #3b82f6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .blog-header-content p {
                    font-size: 1.2rem;
                    color: #a1a1aa;
                    line-height: 1.6;
                }

                /* Search and Filters */
                .search-filter-section {
                    padding: 2rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    background: #09090b;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .filter-wrapper {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                }
                .search-bar-premium {
                    position: relative;
                    width: 300px;
                }
                .search-bar-premium svg {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #71717a;
                }
                .search-bar-premium input {
                    width: 100%;
                    padding: 0.8rem 1rem 0.8rem 2.5rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: #fff;
                    outline: none;
                    transition: border-color 0.3s;
                }
                .search-bar-premium input:focus { border-color: #3b82f6; }
                
                .category-pills {
                    display: flex;
                    gap: 0.75rem;
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                }
                .pill {
                    padding: 0.5rem 1.25rem;
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #a1a1aa;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }
                .pill:hover { background: rgba(255,255,255,0.05); color: #fff; }
                .pill.active { background: #fff; color: #000; border-color: #fff; font-weight: 600; }

                /* Featured Section */
                .featured-premium {
                    padding: 4rem 2rem;
                    background: #09090b;
                }
                .featured-wrapper {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 24px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.4s ease, box-shadow 0.4s ease;
                }
                .featured-wrapper:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                    border-color: rgba(255,255,255,0.1);
                }
                .featured-image-box { position: relative; height: 100%; min-height: 400px; }
                .featured-image-box img { width: 100%; height: 100%; object-fit: cover; }
                .featured-tag {
                    position: absolute; top: 1.5rem; left: 1.5rem;
                    background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
                    color: #fff; padding: 0.5rem 1rem; border-radius: 8px;
                    font-size: 0.8rem; font-weight: 600; border: 1px solid rgba(255,255,255,0.1);
                }
                .featured-info { padding: 4rem 3rem; display: flex; flex-direction: column; justify-content: center; }
                .featured-info .category { color: #60a5fa; font-weight: 600; font-size: 0.9rem; margin-bottom: 1rem; }
                .featured-info h2 { font-size: 2.2rem; margin-bottom: 1.5rem; line-height: 1.2; letter-spacing: -0.01em; }
                .featured-info p { color: #a1a1aa; font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem; }
                .featured-info .meta { display: flex; gap: 1.5rem; color: #71717a; font-size: 0.9rem; margin-bottom: 2rem; }
                .featured-info .meta span { display: flex; align-items: center; gap: 0.5rem; }
                .btn-read-feat {
                    align-self: flex-start; padding: 0.8rem 1.5rem; background: #fff; color: #000;
                    border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
                    display: flex; align-items: center; gap: 0.5rem; transition: background 0.3s;
                }
                .btn-read-feat:hover { background: #e4e4e7; }

                /* Grid Layout */
                .grid-premium { padding: 2rem 2rem 6rem; }
                .grid-wrapper {
                    max-width: 1200px; margin: 0 auto;
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem;
                }
                .premium-card {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px; overflow: hidden;
                    cursor: pointer; transition: all 0.3s ease;
                    display: flex; flex-direction: column;
                }
                .premium-card:hover {
                    transform: translateY(-4px);
                    border-color: rgba(255,255,255,0.15);
                    background: rgba(255,255,255,0.03);
                }
                .card-img-wrap { position: relative; height: 220px; }
                .card-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
                .card-category {
                    position: absolute; bottom: 1rem; left: 1rem;
                    background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
                    color: #fff; padding: 0.4rem 0.8rem; border-radius: 6px;
                    font-size: 0.8rem; font-weight: 500; display: flex; align-items: center; gap: 0.4rem;
                }
                .card-text { padding: 1.5rem; flex: 1; }
                .card-text h3 { font-size: 1.3rem; margin-bottom: 0.75rem; line-height: 1.4; color: #fff; }
                .card-text p { color: #a1a1aa; font-size: 0.95rem; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
                .card-footer {
                    padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.05);
                    display: flex; justify-content: space-between; align-items: center;
                }
                .author-mini { display: flex; align-items: center; gap: 0.75rem; }
                .author-mini .av { width: 32px; height: 32px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: bold; }
                .author-mini span { font-size: 0.9rem; color: #d4d4d8; font-weight: 500; }
                .card-footer .date { font-size: 0.85rem; color: #71717a; }

                /* Article View */
                .article-view-premium { padding: 2rem 2rem 6rem; background: #09090b; }
                .article-container { max-width: 800px; margin: 0 auto; }
                .back-to-blog-btn {
                    display: flex; align-items: center; gap: 0.5rem; background: none; border: none;
                    color: #a1a1aa; font-size: 1rem; cursor: pointer; margin-bottom: 2rem; transition: color 0.3s;
                }
                .back-to-blog-btn:hover { color: #fff; }
                
                .premium-article { background: transparent; }
                .article-hero { margin-bottom: 3rem; }
                .category-pill { display: inline-flex; align-items: center; gap: 0.5rem; color: #60a5fa; font-weight: 600; margin-bottom: 1rem; font-size: 0.9rem; }
                .article-hero h1 { font-size: 3rem; line-height: 1.2; letter-spacing: -0.02em; margin-bottom: 2rem; color: #fff; }
                .meta-bar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 0; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 2rem; }
                .author-block { display: flex; align-items: center; gap: 1rem; }
                .author-block .author-avatar { width: 50px; height: 50px; border-radius: 50%; background: #3b82f6; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: bold; }
                .author-details strong { display: block; font-size: 1.1rem; color: #fff; }
                .author-details span { color: #a1a1aa; font-size: 0.9rem; }
                .stats-block { display: flex; gap: 1.5rem; color: #a1a1aa; font-size: 0.95rem; }
                .stats-block span { display: flex; align-items: center; gap: 0.5rem; }
                .article-hero-image img { width: 100%; border-radius: 16px; object-fit: cover; max-height: 450px; }
                
                .article-body { font-size: 1.1rem; line-height: 1.8; color: #d4d4d8; padding-bottom: 3rem; }
                .article-h2 { font-size: 1.8rem; color: #fff; margin: 3rem 0 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; }
                .article-h3 { font-size: 1.4rem; color: #fff; margin: 2rem 0 1rem; }
                .article-p { margin-bottom: 1.5rem; }
                .article-ul { margin-bottom: 1.5rem; padding-left: 1.5rem; list-style-type: disc; }
                .article-ul li { margin-bottom: 0.5rem; }
                .article-quote { border-left: 4px solid #3b82f6; padding: 1.5rem; background: rgba(59,130,246,0.05); font-style: italic; margin: 2rem 0; border-radius: 0 8px 8px 0; color: #e4e4e7; }
                
                .table-wrapper { overflow-x: auto; margin: 2rem 0; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }
                .table-wrapper table { width: 100%; border-collapse: collapse; text-align: left; }
                .table-wrapper td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
                .table-header { background: rgba(255,255,255,0.05); font-weight: 600; color: #fff; }

                .article-sharing { padding: 2rem 0; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; }
                .btn-share { display: flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; transition: background 0.3s; }
                .btn-share:hover { background: rgba(255,255,255,0.1); }

                /* Comments Section with Anti-Bot */
                .comments-section { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 3rem; margin-top: 2rem; }
                .comments-header h2 { font-size: 1.5rem; display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; }
                
                .comments-list { margin-bottom: 3rem; }
                .comment-card { display: flex; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .comment-card:last-child { border-bottom: none; }
                .comment-avatar { width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; }
                .comment-meta { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 0.5rem; }
                .comment-meta strong { color: #fff; font-size: 1.1rem; }
                .comment-date { color: #71717a; font-size: 0.85rem; }
                .comment-content p { color: #d4d4d8; line-height: 1.6; }
                .no-comments { color: #a1a1aa; font-style: italic; text-align: center; padding: 2rem 0; }

                .comment-form { background: #000; padding: 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
                .comment-form h3 { font-size: 1.3rem; margin-bottom: 0.5rem; }
                .form-subtitle { color: #71717a; font-size: 0.9rem; margin-bottom: 2rem; }
                
                .hidden-field { display: none; opacity: 0; position: absolute; top: -9999px; left: -9999px; }
                
                .input-group { margin-bottom: 1.5rem; }
                .input-group label { display: block; margin-bottom: 0.5rem; color: #d4d4d8; font-size: 0.95rem; font-weight: 500; }
                .input-group input, .input-group textarea { width: 100%; padding: 1rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-family: inherit; font-size: 1rem; transition: border-color 0.3s; }
                .input-group input:focus, .input-group textarea:focus { border-color: #3b82f6; outline: none; }
                
                .bot-check { background: rgba(59,130,246,0.05); padding: 1.5rem; border-radius: 8px; border: 1px dashed rgba(59,130,246,0.3); }
                .bot-check label { color: #60a5fa; }
                .bot-check strong { font-size: 1.2rem; color: #fff; background: rgba(0,0,0,0.3); padding: 0.2rem 0.6rem; border-radius: 4px; margin-left: 0.5rem; }
                
                .btn-post-comment { background: #fff; color: #000; border: none; padding: 1rem 2rem; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: opacity 0.3s; width: 100%; }
                .btn-post-comment:hover { opacity: 0.9; }

                /* Newsletter */
                .newsletter-premium { padding: 5rem 2rem; background: linear-gradient(to top, rgba(59,130,246,0.1), transparent); border-top: 1px solid rgba(255,255,255,0.05); text-align: center; }
                .newsletter-content { max-width: 600px; margin: 0 auto; }
                .newsletter-content h2 { font-size: 2.2rem; margin-bottom: 1rem; letter-spacing: -0.01em; }
                .newsletter-content p { color: #a1a1aa; font-size: 1.1rem; margin-bottom: 2.5rem; }
                .subscribe-box { display: flex; gap: 0.5rem; background: rgba(255,255,255,0.03); padding: 0.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
                .subscribe-box input { flex: 1; background: transparent; border: none; padding: 0.8rem 1rem; color: #fff; outline: none; font-size: 1rem; }
                .subscribe-box button { background: #fff; color: #000; border: none; padding: 0 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
                .privacy-note { font-size: 0.85rem !important; margin-top: 1rem !important; opacity: 0.6; }

                @media (max-width: 768px) {
                    .featured-wrapper { grid-template-columns: 1fr; }
                    .featured-image-box { min-height: 250px; }
                    .article-hero h1 { font-size: 2.2rem; }
                    .meta-bar { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
                    .blog-header-content h1 { font-size: 2.5rem; }
                    .comments-section { padding: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default Blog;
