import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft, HiClock, HiUser, HiArrowRight, HiSearch, HiTag, HiX, HiCalendar, HiBookOpen } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Blog = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [email, setEmail] = useState('');

    const categories = ['all', 'Product Updates', 'Industry Insights', 'Best Practices', 'Case Studies'];

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
        },
        {
            id: 6,
            title: 'The Future of Promotional Marketing: Trends Shaping 2026 and Beyond',
            excerpt: 'Industry analysis of emerging technologies, changing consumer behaviors, and regulatory shifts impacting promotional campaigns.',
            category: 'Industry Insights',
            author: 'Research Team',
            authorRole: 'Market Research',
            date: '2026-01-10',
            readTime: '9 min read',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
            featured: false,
            content: `
## Executive Summary

The promotional marketing industry is undergoing rapid transformation driven by technology, privacy regulations, and changing consumer expectations. This report examines the key trends shaping the industry in 2026 and beyond.

## Trend 1: Privacy-First Marketing

**The Shift**
- Stricter data protection laws globally
- Consumer awareness of privacy rights
- Brand reputation tied to ethical practices

**Implications**
- Face blurring becoming standard practice
- Consent workflows for promotional content
- Audit trails for compliance documentation

**PromoSecure Position**: Our AI face blurring technology positions users ahead of regulatory requirements.

## Trend 2: Real-Time Campaign Intelligence

**The Shift**
- Clients demand instant visibility
- Decisions made in hours, not days
- Competitive advantage from speed

**Implications**
- Real-time dashboards replacing weekly reports
- Automated anomaly detection
- Predictive analytics for campaign optimization

**PromoSecure Position**: Advanced Analytics Dashboard provides real-time insights with trend analysis.

## Trend 3: Mobile-First Field Operations

**The Shift**
- 95% of field work on mobile devices
- Expectations set by consumer apps
- Resistance to clunky enterprise tools

**Implications**
- Consumer-grade UX for enterprise tools
- Offline capabilities essential
- Camera-centric workflows

**PromoSecure Position**: Mobile-optimized PWA with native camera integration.

## Trend 4: Gig Economy Integration

**The Shift**
- Flexible workforce models
- Rapid scaling capabilities
- Variable cost structures

**Implications**
- Easy onboarding for temporary promoters
- Skill-based assignment algorithms
- Performance-based compensation

**PromoSecure Position**: Streamlined promoter management with quick onboarding.

## Trend 5: Sustainability Documentation

**The Shift**
- ESG reporting requirements
- Brand sustainability commitments
- Consumer preference for ethical brands

**Implications**
- Campaign carbon footprint tracking
- Sustainable material documentation
- Environmental compliance proof

**Looking Ahead**: Future PromoSecure features may include sustainability metrics.

## Recommendations for Agencies

1. **Invest in privacy infrastructure now** – Regulations will only tighten
2. **Build real-time reporting capabilities** – Client expectations are rising
3. **Prioritize mobile experience** – Your field team's productivity depends on it
4. **Develop flexible workforce models** – Agility is competitive advantage
5. **Prepare for sustainability requirements** – Document environmental practices

## Conclusion

The promotional marketing industry is evolving rapidly. Agencies that embrace technology, prioritize privacy, and build flexible operations will thrive. Those clinging to manual processes and outdated workflows risk obsolescence.

PromoSecure is committed to staying ahead of these trends, ensuring our customers are always positioned for success.
            `
        },
        {
            id: 7,
            title: 'Building an Effective Promoter Training Program',
            excerpt: 'A comprehensive guide to onboarding and training field promoters for maximum campaign success.',
            category: 'Best Practices',
            author: 'Customer Success',
            authorRole: 'Training Specialist',
            date: '2026-01-05',
            readTime: '6 min read',
            image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=400&fit=crop',
            featured: false,
            content: `
## Why Training Matters

Our data shows that properly trained promoters achieve:
- **43% higher** first-attempt approval rates
- **28% more** photos per shift
- **65% lower** support ticket volume

Yet many agencies skip formal training, expecting promoters to "figure it out."

## The PromoSecure Training Framework

### Week 1: App Fundamentals

**Day 1-2: Account Setup**
- App installation and login
- Profile configuration
- Navigating the interface

**Day 3-4: Photo Capture**
- Camera settings optimization
- Batch creation workflow
- Metadata and tagging

**Day 5: Submission Process**
- Quality self-check before submit
- Understanding status indicators
- Handling rejections constructively

### Week 2: Quality Standards

**Day 1-2: Composition Basics**
- Rule of thirds
- Lighting considerations
- Background cleanup

**Day 3-4: Brand Guidelines**
- Product positioning
- Required elements
- Prohibited content

**Day 5: Practice Session**
- Supervised store visit
- Real-time feedback
- Q&A session

### Week 3: Advanced Features

**Day 1-2: Communication**
- Using the messaging system
- Reporting issues
- Requesting support

**Day 3-4: Troubleshooting**
- Offline mode procedures
- App updates
- Common error resolution

**Day 5: Assessment**
- Practical evaluation
- Written knowledge check
- Certification

## Training Resources

### Documentation
- Step-by-step guides with screenshots
- Video tutorials for complex workflows
- FAQ document for common questions

### Ongoing Support
- Weekly Q&A sessions for new promoters
- Peer mentorship program
- Manager office hours

## Measuring Training Effectiveness

Track these metrics for each promoter cohort:
- Time to first approved batch
- First-month approval rate
- Support ticket volume
- Retention at 90 days

## Common Training Mistakes

1. **Information overload** – Spread learning over time
2. **No hands-on practice** – Theory alone doesn't work
3. **Assuming tech literacy** – Start with basics
4. **One-and-done approach** – Ongoing reinforcement needed
5. **Ignoring feedback** – Promoters have valuable input

Invest in training, and your campaigns will benefit for years to come.
            `
        },
        {
            id: 8,
            title: 'Integrating PromoSecure with Your Existing Tech Stack',
            excerpt: 'Technical guide to connecting PromoSecure with CRM, ERP, and reporting systems via our API.',
            category: 'Product Updates',
            author: 'Engineering Team',
            authorRole: 'Developer Relations',
            date: '2025-12-28',
            readTime: '5 min read',
            image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
            featured: false,
            content: `
## API Overview

PromoSecure provides a comprehensive REST API enabling seamless integration with your existing business systems. Whether you need to sync data with Salesforce, generate custom reports in Power BI, or trigger workflows in Zapier, our API makes it possible.

## Authentication

All API requests require authentication via Bearer token:

\`\`\`
Authorization: Bearer {your_api_token}
\`\`\`

Generate tokens in Settings → API Access (Pro and Enterprise plans only).

## Core Endpoints

### Batches

\`\`\`
GET /api/v1/batches
GET /api/v1/batches/{id}
GET /api/v1/batches/{id}/photos
\`\`\`

### Photos

\`\`\`
GET /api/v1/photos/{id}
GET /api/v1/photos/{id}/download
\`\`\`

### Analytics

\`\`\`
GET /api/v1/analytics/summary
GET /api/v1/analytics/promoters
GET /api/v1/analytics/trends
\`\`\`

## Common Integration Patterns

### CRM Sync (Salesforce, HubSpot)
- Sync promoter data as contacts
- Create campaign records from batches
- Attach photos to opportunity records

### BI Integration (Power BI, Tableau)
- Pull analytics data for custom dashboards
- Combine with sales data for ROI analysis
- Create executive-level visualizations

### Workflow Automation (Zapier, Make)
- Trigger notifications on batch approval
- Create tasks for rejected batches
- Update external systems on completion

## Rate Limits

| Plan | Requests/Hour |
|------|---------------|
| Pro | 1,000 |
| Enterprise | 10,000 |

## Support

For API support, contact api-support@promosecure.com or visit our developer documentation at docs.promosecure.com.
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
        toast.success('Successfully subscribed! Check your inbox.');
        setEmail('');
    };

    return (
        <div className="blog-page">
            {/* Header */}
            <header className="blog-header">
                <Link to="/" className="back-link">
                    <HiArrowLeft /> Back to Home
                </Link>
                <div className="blog-header-content">
                    <h1>PromoSecure Blog</h1>
                    <p>Insights, product updates, and best practices for promotional campaign success</p>
                </div>
            </header>

            {/* Featured Post */}
            {featuredPost && !selectedArticle && (
                <section className="featured-section">
                    <div className="featured-container">
                        <div className="featured-post">
                            <div className="featured-image">
                                <img src={featuredPost.image} alt={featuredPost.title} />
                                <span className="featured-badge">Featured</span>
                            </div>
                            <div className="featured-content">
                                <span className="post-category">{featuredPost.category}</span>
                                <h2>{featuredPost.title}</h2>
                                <p>{featuredPost.excerpt}</p>
                                <div className="post-meta">
                                    <span><HiUser /> {featuredPost.author}</span>
                                    <span><HiClock /> {featuredPost.readTime}</span>
                                </div>
                                <button className="read-more-btn" onClick={() => setSelectedArticle(featuredPost)}>
                                    Read Article <HiArrowRight />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Article View */}
            {selectedArticle && (
                <section className="article-section">
                    <div className="article-container">
                        <button className="back-to-blog" onClick={() => setSelectedArticle(null)}>
                            <HiArrowLeft /> Back to Blog
                        </button>
                        <article className="full-article">
                            <div className="article-header">
                                <span className="post-category"><HiTag /> {selectedArticle.category}</span>
                                <h1>{selectedArticle.title}</h1>
                                <div className="article-meta">
                                    <div className="author-info">
                                        <div className="author-avatar">{selectedArticle.author.charAt(0)}</div>
                                        <div>
                                            <strong>{selectedArticle.author}</strong>
                                            <span>{selectedArticle.authorRole}</span>
                                        </div>
                                    </div>
                                    <div className="article-stats">
                                        <span><HiCalendar /> {new Date(selectedArticle.date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        <span><HiBookOpen /> {selectedArticle.readTime}</span>
                                    </div>
                                </div>
                            </div>
                            <img src={selectedArticle.image} alt={selectedArticle.title} className="article-cover" />
                            <div className="article-content" dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\n/g, '<br/>').replace(/## /g, '<h2>').replace(/### /g, '<h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\|(.*?)\|/g, '<span class="table-cell">$1</span>') }} />
                            <div className="article-footer">
                                <p>Have questions about this article? <a href="mailto:vigneshigt@gmail.com">Contact us</a></p>
                            </div>
                        </article>
                    </div>
                </section>
            )}

            {/* Search and Filter */}
            {!selectedArticle && (
                <>
                    <section className="blog-filters">
                        <div className="filters-container">
                            <div className="search-box">
                                <HiSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="category-tabs">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat === 'all' ? 'All Posts' : cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Blog Grid */}
                    <section className="blog-grid-section">
                        <div className="blog-container">
                            <div className="blog-grid">
                                {filteredPosts.filter(p => !p.featured).map((post, index) => (
                                    <article
                                        key={post.id}
                                        className="blog-card"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                        onClick={() => setSelectedArticle(post)}
                                    >
                                        <div className="card-image">
                                            <img src={post.image} alt={post.title} />
                                        </div>
                                        <div className="card-content">
                                            <span className="post-category">
                                                <HiTag /> {post.category}
                                            </span>
                                            <h3>{post.title}</h3>
                                            <p>{post.excerpt}</p>
                                            <div className="post-meta">
                                                <span><HiClock /> {post.readTime}</span>
                                                <span>{new Date(post.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            {filteredPosts.length === 0 && (
                                <div className="no-posts">
                                    <p>No articles found matching your criteria.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Newsletter CTA */}
                    <section className="newsletter-section">
                        <div className="newsletter-container">
                            <h2>Stay Updated</h2>
                            <p>Get the latest product updates, industry insights, and best practices delivered to your inbox.</p>
                            <form className="newsletter-form" onSubmit={handleSubscribe}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary">Subscribe</button>
                            </form>
                            <p className="newsletter-note">No spam. Unsubscribe anytime.</p>
                        </div>
                    </section>
                </>
            )}

            <style>{`
                .blog-page {
                    min-height: 100vh;
                    background: var(--bg-primary);
                }

                .blog-header {
                    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
                    padding: 2rem 2rem 4rem;
                    text-align: center;
                    position: relative;
                }

                .back-link {
                    position: absolute;
                    top: 1.5rem;
                    left: 2rem;
                    color: white;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    opacity: 0.9;
                    transition: opacity 0.2s;
                }

                .back-link:hover {
                    opacity: 1;
                }

                .blog-header-content {
                    max-width: 600px;
                    margin: 0 auto;
                    padding-top: 2rem;
                }

                .blog-header h1 {
                    color: white;
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                }

                .blog-header p {
                    color: rgba(255, 255, 255, 0.85);
                    font-size: 1.1rem;
                }

                .featured-section {
                    padding: 3rem 2rem;
                    margin-top: -2rem;
                }

                .featured-container {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .featured-post {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 2rem;
                    background: var(--bg-card);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                }

                .featured-image {
                    position: relative;
                }

                .featured-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .featured-badge {
                    position: absolute;
                    top: 1rem;
                    left: 1rem;
                    background: linear-gradient(135deg, #ef4444, #f97316);
                    color: white;
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .featured-content {
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .post-category {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    color: var(--brand-primary);
                    font-size: 0.85rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .featured-content h2 {
                    font-size: 1.5rem;
                    margin-bottom: 0.75rem;
                    line-height: 1.3;
                }

                .featured-content p {
                    color: var(--text-secondary);
                    margin-bottom: 1rem;
                    line-height: 1.6;
                }

                .post-meta {
                    display: flex;
                    gap: 1rem;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    margin-bottom: 1rem;
                }

                .post-meta span {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .read-more-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--brand-gradient);
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    width: fit-content;
                }

                .read-more-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 20px rgba(37, 99, 235, 0.3);
                }

                /* Article View */
                .article-section {
                    padding: 2rem;
                }

                .article-container {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .back-to-blog {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: none;
                    border: none;
                    color: var(--brand-primary);
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 2rem;
                    padding: 0;
                }

                .back-to-blog:hover {
                    text-decoration: underline;
                }

                .full-article {
                    background: var(--bg-card);
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                }

                .article-header {
                    padding: 2rem 2rem 1rem;
                }

                .article-header h1 {
                    font-size: 2rem;
                    line-height: 1.3;
                    margin-bottom: 1.5rem;
                }

                .article-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .author-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .author-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: var(--brand-gradient);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.25rem;
                }

                .author-info > div {
                    display: flex;
                    flex-direction: column;
                }

                .author-info span {
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }

                .article-stats {
                    display: flex;
                    gap: 1.5rem;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .article-stats span {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .article-cover {
                    width: 100%;
                    max-height: 400px;
                    object-fit: cover;
                }

                .article-content {
                    padding: 2rem;
                    line-height: 1.8;
                    color: var(--text-secondary);
                }

                .article-content h2 {
                    color: var(--text-primary);
                    margin: 2rem 0 1rem;
                    font-size: 1.5rem;
                }

                .article-content h3 {
                    color: var(--text-primary);
                    margin: 1.5rem 0 0.75rem;
                    font-size: 1.2rem;
                }

                .article-content strong {
                    color: var(--text-primary);
                }

                .article-footer {
                    padding: 1.5rem 2rem;
                    background: var(--bg-tertiary);
                    text-align: center;
                }

                .article-footer a {
                    color: var(--brand-primary);
                    font-weight: 600;
                }

                .blog-filters {
                    padding: 0 2rem 2rem;
                }

                .filters-container {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .search-box {
                    position: relative;
                    margin-bottom: 1rem;
                }

                .search-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }

                .search-box input {
                    width: 100%;
                    padding: 1rem 1rem 1rem 3rem;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    background: var(--bg-card);
                    font-size: 1rem;
                    color: var(--text-primary);
                }

                .category-tabs {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .category-tab {
                    padding: 0.5rem 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: 20px;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .category-tab.active,
                .category-tab:hover {
                    background: var(--brand-primary);
                    color: white;
                    border-color: var(--brand-primary);
                }

                .blog-grid-section {
                    padding: 0 2rem 4rem;
                }

                .blog-container {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .blog-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                }

                .blog-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    animation: fadeInUp 0.5s ease forwards;
                    opacity: 0;
                    cursor: pointer;
                }

                .blog-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    border-color: var(--brand-primary);
                }

                .card-image img {
                    width: 100%;
                    height: 160px;
                    object-fit: cover;
                }

                .card-content {
                    padding: 1.25rem;
                }

                .card-content h3 {
                    font-size: 1rem;
                    margin-bottom: 0.5rem;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .card-content p {
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                    line-height: 1.5;
                    margin-bottom: 1rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .no-posts {
                    text-align: center;
                    padding: 3rem;
                    color: var(--text-muted);
                }

                .newsletter-section {
                    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
                    padding: 4rem 2rem;
                    text-align: center;
                }

                .newsletter-container {
                    max-width: 500px;
                    margin: 0 auto;
                }

                .newsletter-container h2 {
                    color: white;
                    margin-bottom: 0.5rem;
                }

                .newsletter-container p {
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 1.5rem;
                }

                .newsletter-form {
                    display: flex;
                    gap: 0.5rem;
                }

                .newsletter-form input {
                    flex: 1;
                    padding: 1rem;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                }

                .newsletter-form .btn {
                    padding: 1rem 1.5rem;
                }

                .newsletter-note {
                    font-size: 0.85rem;
                    margin-top: 1rem;
                    opacity: 0.7;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 768px) {
                    .featured-post {
                        grid-template-columns: 1fr;
                    }
                    .blog-grid {
                        grid-template-columns: 1fr;
                    }
                    .newsletter-form {
                        flex-direction: column;
                    }
                    .article-meta {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            `}</style>
        </div>
    );
};

export default Blog;
