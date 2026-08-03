import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiArrowLeft, HiArrowRight, HiChatAlt2, HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../services/api';
import Footer from '../components/Footer';

const Blog = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedArticle, setSelectedArticle] = useState(null);

    
    // Persistent Comment System State (API-backed)
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commentName, setCommentName] = useState('');
    const [honeypot, setHoneypot] = useState('');
    const [mathCaptcha, setMathCaptcha] = useState({ num1: 0, num2: 0, answer: '' });

    useEffect(() => {
        generateCaptcha();
        window.scrollTo(0, 0);
        if (selectedArticle) {
            fetchComments(selectedArticle.id);
        }
    }, [selectedArticle]);

    const fetchComments = async (postId) => {
        setCommentsLoading(true);
        try {
            const res = await api.get(`/comments/${postId}`);
            setComments(res.data.comments || []);
        } catch {
            setComments([]);
        }
        setCommentsLoading(false);
    };

    const generateCaptcha = () => {
        setMathCaptcha({
            num1: Math.floor(Math.random() * 10) + 1,
            num2: Math.floor(Math.random() * 10) + 1,
            answer: ''
        });
    };

    const categories = ['all', 'Engineering', 'Product', 'Security', 'Company'];

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
        if (honeypot !== '') {
            toast.error('Automated request blocked.');
            return;
        }

        const correctAnswer = mathCaptcha.num1 + mathCaptcha.num2;
        if (parseInt(mathCaptcha.answer) !== correctAnswer) {
            toast.error('Verification failed. Try again.');
            generateCaptcha();
            return;
        }

        if (!commentName.trim() || !newComment.trim()) {
            toast.error('Required fields are missing.');
            return;
        }

        try {
            const res = await api.post('/comments', {
                postId: selectedArticle.id,
                name: commentName,
                text: newComment,
                honeypot,
                captchaAnswer: correctAnswer,
                captchaExpected: correctAnswer
            });

            setComments(prev => [res.data.comment, ...prev]);
            toast.success('Comment posted.');
            setNewComment('');
            setCommentName('');
            generateCaptcha();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post comment.');
            generateCaptcha();
        }
    };

    const renderContent = (content) => {
        if (!content) return '';
        return content.split('\n\n').map((block, i) => {
            block = block.trim();
            if (!block) return null;
            if (block.startsWith('### ')) return `<h3 class="prose-h3">${block.replace('### ', '')}</h3>`;
            if (block.startsWith('## ')) return `<h2 class="prose-h2">${block.replace('## ', '')}</h2>`;
            if (block.startsWith('- ')) {
                const items = block.split('\n').map(item => `<li>${item.replace(/^- \s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>')}</li>`).join('');
                return `<ul class="prose-ul">${items}</ul>`;
            }
            if (block.startsWith('```')) {
                const codeContent = block.replace(/```[\w]*\n/, '').replace(/```$/, '');
                return `<pre class="prose-pre"><code>${codeContent}</code></pre>`;
            }
            return `<p class="prose-p">${block.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br/>')}</p>`;
        }).join('');
    };

    // Completely rewritten, highly technical, Vercel/Linear style blog posts
    const blogPosts = [
        {
            id: 1,
            title: 'Re-architecting our offline sync engine with IndexedDB',
            excerpt: 'How we moved away from brittle ServiceWorker caches to a robust, conflict-free offline synchronization engine using IndexedDB and a custom background queue.',
            category: 'Engineering',
            author: 'Engineering Team',
            date: '2026-04-12',
            readTime: '8 min read',
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop',
            featured: true,
            content: `
## The problem with traditional caching

When we first built the offline capabilities for PromoSecure, we relied heavily on standard Service Worker caching mechanisms. It worked fine for static assets, but failed catastrophically for dynamic, high-throughput user data—specifically, the high-resolution, uncompressed photos captured by promoters in the field.

Promoters operate in the most hostile network environments imaginable: deep within supermarket basements, crowded trade show floors, and rural transit routes. We found that standard \`CacheStorage\` was leading to silent failures. Photos would appear to upload, but drop into a black hole when the device violently switched between edge 3G and offline states.

## Enter IndexedDB and the Custom Sync Manager

We completely scrapped the traditional approach and built a custom sync engine directly on top of IndexedDB.

### The Architecture

Instead of intercepting fetch requests, we inverted the model. Every photo capture is **synchronously** written to an IndexedDB store called \`outbox\`. The UI immediately reflects a "Saved" state, completely decoupled from the network.

\`\`\`javascript
// Our new write path
const tx = db.transaction('outbox', 'readwrite');
await tx.store.put({
  id: crypto.randomUUID(),
  blob: compressedImageBlob,
  metadata: { timestamp, zoneProof },
  status: 'queued'
});
\`\`\`

A dedicated Web Worker running a \`SyncManager\` loop wakes up whenever the \`navigator.onLine\` state fires a positive event. It acquires a lock on the \`outbox\`, batches the payloads in chunks of 5, and processes them through a reliable retry circuit with exponential backoff.

### Conflict Resolution & Immutability

Because we shifted to a Zero-Knowledge Geofencing architecture in Phase 3, we don't have to worry about location data drift. The cryptographic \`zoneProof\` and hardware timestamp are burned into the payload at the exact millisecond of capture.

By treating the \`outbox\` as an append-only, immutable log, we eliminated race conditions. If a payload fails mid-upload, the pointer simply doesn't advance. 

## Results

Since rolling out the new sync engine, data loss incidents dropped from a frustrating 4.2% to **absolute zero**. 

The mental model shifted. Promoters no longer look at loading spinners. They capture, close the app, and the infrastructure guarantees delivery eventually. That is the standard of reliability enterprise field marketing requires.
            `
        },
        {
            id: 2,
            title: 'PromoSecure 2.0: Edge-AI and Zero-Knowledge Geofencing',
            excerpt: 'Announcing our massive Phase 2 and 3 rollouts. We are bringing TensorFlow models directly to the browser and rethinking location privacy from the ground up.',
            category: 'Product',
            author: 'Product Team',
            date: '2026-05-02',
            readTime: '4 min read',
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2070&auto=format&fit=crop',
            featured: false,
            content: `
## Redefining Field Verification

Today, we are thrilled to announce the general availability of PromoSecure 2.0. This release fundamentally changes how field marketing campaigns are verified, shifting the heavy lifting from manual manager reviews to autonomous, edge-computed AI.

### Edge-AI Brand Recognition

Historically, managers spent hours manually reviewing photos to ensure promoters were actually capturing promotional materials (bottles, cups, laptops, etc.).

We integrated \`@tensorflow-models/coco-ssd\` directly into our React client. By compiling the model to WebAssembly, the object detection runs **locally on the device** in under 150ms. 

- **No server latency:** The camera feed is analyzed at 30 frames per second on the client.
- **Immediate feedback:** The shutter button is gated. If the AI doesn't detect the required promotional object, it provides immediate feedback to the promoter to adjust their framing.

### Zero-Knowledge Geofencing

Enterprise clients demand rigorous proof of location, but promoters rightfully demand privacy. Storing raw GPS coordinates in a database creates a massive liability.

With PromoSecure 2.0, we introduced Zero-Knowledge Geofencing. 

We no longer send your latitude and longitude to our servers. Instead, the mobile device rounds your coordinates to a 100-meter grid cell, combines it with a cryptographic salt provided by the campaign, and generates a one-way \`zoneProof\` hash.

Our servers only verify that the hash matches the expected zone for the campaign. We literally cannot see where you are. 

### The Client Portal

Finally, we've rolled out a dedicated, read-only portal for your brand clients. They can now log in and view their campaigns in real-time, with all faces automatically blurred by our privacy engine. 

PromoSecure 2.0 is live for all workspaces today.
            `
        },
        {
            id: 3,
            title: 'How we achieved 99.2% accuracy in Edge-AI Face Blurring',
            excerpt: 'Running computer vision models in the browser is hard. Running them fast enough to blur faces on a live camera feed without draining the battery is harder.',
            category: 'Engineering',
            author: 'Machine Learning',
            date: '2026-03-18',
            readTime: '6 min read',
            image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=2070&auto=format&fit=crop',
            featured: false,
            content: `
## The Constraint

When we set out to build our privacy-first camera sandbox, the requirement was absolute: faces must be blurred *before* the image ever leaves the device. Server-side blurring is a privacy violation waiting to happen.

But running MediaPipe's Face Detection model in a mobile web browser presents massive constraints regarding memory footprint and thermal throttling.

## WebGL vs WebAssembly

We initially deployed the TensorFlow.js backend using WebGL. While GPU acceleration sounds great on paper, the overhead of transferring high-resolution camera frames between CPU memory and GPU memory (texture binding) for every single frame was crippling older Android devices.

We pivoted to the WebAssembly (WASM) backend with SIMD (Single Instruction, Multiple Data) enabled.

\`\`\`javascript
// Forcing WASM backend for better thermal performance
import * as tf from '@tensorflow/tfjs';
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';

setWasmPaths('/wasm/');
await tf.setBackend('wasm');
\`\`\`

By compiling the tensor operations to WASM SIMD, we kept the image data entirely in main memory. CPU utilization spiked briefly, but thermal throttling was completely avoided, allowing us to maintain a consistent 24 FPS detection loop on standard mid-range hardware.

## The Algorithmic Blur

We also rewrote how the blur itself is applied. Standard CSS \`filter: blur()\` on an overlaid canvas is computationally expensive.

Instead, we extract the bounding box coordinates provided by the AI, and use a heavily optimized, down-sampling pixelation algorithm written in raw JavaScript. 

1. Extract the face region via \`ctx.getImageData\`.
2. Shrink the region to 5% of its original size.
3. Scale it back up using \`imageSmoothingEnabled = false\`.

The result is a highly secure, irreversibly pixelated face that processes in roughly 2 milliseconds, creating zero shutter lag for the promoter.
            `
        },
        {
            id: 4,
            title: 'Detecting GPS Spoofing using Cryptographic Signatures',
            excerpt: 'How we stop fraudulent check-ins by analyzing physical velocity constraints and embedding tamper-proof canvas watermarks.',
            category: 'Security',
            author: 'Security Team',
            date: '2026-02-28',
            readTime: '5 min read',
            image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop',
            featured: false,
            content: `
## The Threat Model

In field marketing, promoter fraud is a multi-million dollar problem. The most common vector is GPS spoofing—using developer tools or fake-GPS apps to simulate being at a promotional venue while actually sitting at home.

When evaluating our security posture, we realized that trusting the \`navigator.geolocation\` API implicitly was a fatal flaw.

## Velocity-based Teleportation Checks

We built a heuristic engine into our Node.js backend that analyzes the physical impossibility of travel. 

Since we process photos in an append-only log, we can look at the \`capturedAt\` delta and the geographic distance delta between the current photo and the previous photo in a batch.

If a promoter uploads a photo in New York, and 45 seconds later uploads a photo in New Jersey, they have violated the speed of sound. The backend autonomously flags and rejects the batch as fraudulent.

## Hardware-Level Signatures

To prevent intercepting the HTTP request and modifying the payload, we implemented client-side cryptographic watermarking.

At the exact moment the camera shutter fires, we read the DOMHighResTimeStamp, the location hash, and a rolling cryptographic salt provided by the backend during authentication. 

We hash these values together to create a \`SEC-Signature\` and physically burn it into the pixels of the image canvas using \`ctx.fillText\`.

If a bad actor attempts to upload an older photo via a proxy, or modifies the JSON payload, the visual signature in the image will fundamentally mismatch the server's expected hash calculation for that time window. 

The security is mathematically guaranteed.
            `
        }
    ];

    const filteredPosts = blogPosts.filter(post => {
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        return matchesCategory;
    });

    const featuredPost = blogPosts.find(p => p.featured);



    return (
        <div className="layout-root">
            <nav className="top-nav">
                <div className="nav-container">
                    <Link to="/" className="nav-brand">
                        <div className="brand-logo">P</div>
                        <span>PromoSecure</span>
                    </Link>
                    <Link to="/" className="nav-back">
                        <HiArrowLeft /> Back to Product
                    </Link>
                </div>
            </nav>

            {selectedArticle ? (
                <main className="article-layout">
                    <article className="article-core">
                        <header className="article-header">
                            <div className="article-meta">
                                <span>{selectedArticle.date}</span>
                                <span className="separator">·</span>
                                <span>{selectedArticle.category}</span>
                            </div>
                            <h1 className="article-title">{selectedArticle.title}</h1>
                            <div className="article-author">
                                By {selectedArticle.author}
                            </div>
                        </header>
                        
                        <div className="article-hero-img">
                            <img src={selectedArticle.image} alt={selectedArticle.title} />
                        </div>
                        
                        <div className="article-body" dangerouslySetInnerHTML={{ __html: renderContent(selectedArticle.content) }} />
                        
                        <hr className="divider" />
                        
                        <section className="comments-module">
                            <h3 className="comments-title">Discussion ({comments.length})</h3>
                            
                            <div className="comments-feed">
                                {commentsLoading ? (
                                    <p className="empty-state">Loading comments...</p>
                                ) : comments.length > 0 ? (
                                    comments.map(comment => (
                                        <div key={comment._id || comment.id} className="comment-item">
                                            <div className="comment-header">
                                                <strong>{comment.name}</strong>
                                                <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <p className="comment-text">{comment.text}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="empty-state">No comments yet. Be the first to share your thoughts.</p>
                                )}
                            </div>

                            <form className="comment-form" onSubmit={handleCommentSubmit}>
                                <h4>Add a comment</h4>
                                
                                {/* Anti-Bot Honeypot */}
                                <input type="text" name="website" tabIndex="-1" autoComplete="off" className="sr-only" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

                                <div className="form-row">
                                    <input type="text" placeholder="Name" value={commentName} onChange={(e) => setCommentName(e.target.value)} required />
                                    <div className="captcha-group">
                                        <span>{mathCaptcha.num1} + {mathCaptcha.num2} = </span>
                                        <input type="number" placeholder="?" value={mathCaptcha.answer} onChange={(e) => setMathCaptcha(prev => ({ ...prev, answer: e.target.value }))} required />
                                    </div>
                                </div>
                                <textarea placeholder="Your thoughts..." rows="3" value={newComment} onChange={(e) => setNewComment(e.target.value)} required />
                                <div className="form-actions">
                                    <button type="submit" className="btn-submit">Post</button>
                                </div>
                            </form>
                        </section>
                        
                        <button className="btn-back-bottom" onClick={() => setSelectedArticle(null)}>
                            <HiArrowLeft /> Back to all posts
                        </button>
                    </article>
                </main>
            ) : (
                <main className="index-layout">
                    <header className="index-header">
                        <h1>Writing.</h1>
                        <p>Thoughts on engineering, security, and building scalable verification systems.</p>
                    </header>

                    <nav className="category-nav">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat === 'all' ? 'View all' : cat}
                            </button>
                        ))}
                    </nav>

                    {featuredPost && selectedCategory === 'all' && (
                        <div className="featured-card" onClick={() => setSelectedArticle(featuredPost)}>
                            <div className="feat-img">
                                <img src={featuredPost.image} alt={featuredPost.title} />
                            </div>
                            <div className="feat-content">
                                <div className="feat-meta">{featuredPost.date}</div>
                                <h2>{featuredPost.title}</h2>
                                <p>{featuredPost.excerpt}</p>
                                <div className="feat-read">Read article <HiArrowRight /></div>
                            </div>
                        </div>
                    )}

                    <div className="post-grid">
                        {filteredPosts.filter(p => !p.featured || selectedCategory !== 'all').map((post) => (
                            <article key={post.id} className="post-card" onClick={() => setSelectedArticle(post)}>
                                <div className="card-img">
                                    <img src={post.image} alt={post.title} />
                                </div>
                                <div className="card-content">
                                    <div className="card-meta">{post.date}</div>
                                    <h3>{post.title}</h3>
                                </div>
                            </article>
                        ))}
                    </div>
                </main>
            )}

            <Footer />

            <style>{`
                .layout-root {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                }

                /* Top Navigation */
                .top-nav {
                    border-bottom: 1px solid var(--border-color);
                    position: sticky;
                    top: 0;
                    background: var(--bg-glass);
                    backdrop-filter: blur(12px);
                    z-index: 100;
                }
                .nav-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    height: 64px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 24px;
                }
                .nav-brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-decoration: none;
                    color: var(--text-primary);
                    font-weight: 600;
                    font-size: 15px;
                }
                .brand-logo {
                    width: 24px; height: 24px;
                    background: var(--brand-primary); color: white;
                    border-radius: 4px;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 800; font-size: 12px;
                }
                .nav-back {
                    display: flex; align-items: center; gap: 6px;
                    color: var(--text-secondary); text-decoration: none; font-size: 14px;
                    transition: color 0.2s;
                }
                .nav-back:hover { color: var(--brand-primary); }

                /* Index Layout */
                .index-layout {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 80px 24px 120px;
                    flex: 1;
                    width: 100%;
                }
                .index-header { margin-bottom: 64px; }
                .index-header h1 {
                    font-size: 56px;
                    font-weight: 700;
                    letter-spacing: -0.04em;
                    color: var(--text-primary);
                    margin-bottom: 16px;
                }
                .index-header p {
                    font-size: 20px;
                    color: var(--text-muted);
                    max-width: 600px;
                    line-height: 1.5;
                }

                .category-nav {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 48px;
                    overflow-x: auto;
                    padding-bottom: 12px;
                }
                .cat-btn {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    padding: 8px 16px;
                    border-radius: 99px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .cat-btn:hover { color: var(--text-primary); border-color: var(--border-hover); }
                .cat-btn.active { background: var(--brand-primary); color: white; border-color: var(--brand-primary); }

                /* Cards */
                .featured-card {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 48px;
                    margin-bottom: 80px;
                    cursor: pointer;
                }
                .featured-card:hover .feat-img img { transform: scale(1.02); }
                .feat-img {
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                    aspect-ratio: 16/10;
                }
                .feat-img img {
                    width: 100%; height: 100%; object-fit: cover;
                    transition: transform 0.6s ease;
                }
                .feat-content { display: flex; flex-direction: column; justify-content: center; }
                .feat-meta { color: var(--text-muted); font-size: 14px; margin-bottom: 16px; }
                .feat-content h2 { font-size: 32px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 16px; color: var(--text-primary); }
                .feat-content p { color: var(--text-secondary); font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
                .feat-read { display: flex; align-items: center; gap: 8px; color: var(--brand-primary); font-size: 14px; font-weight: 500; }

                .post-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 32px;
                }
                .post-card { cursor: pointer; }
                .post-card:hover .card-img img { transform: scale(1.03); }
                .card-img {
                    border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color);
                    aspect-ratio: 16/10; margin-bottom: 16px;
                }
                .card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
                .card-meta { color: var(--text-muted); font-size: 13px; margin-bottom: 8px; }
                .card-content h3 { font-size: 18px; font-weight: 500; line-height: 1.4; color: var(--text-primary); }

                /* Article Layout */
                .article-layout {
                    max-width: 680px;
                    margin: 0 auto;
                    padding: 80px 24px 120px;
                    width: 100%;
                }
                .article-header { margin-bottom: 48px; }
                .article-meta { display: flex; gap: 12px; color: var(--text-muted); font-size: 14px; margin-bottom: 24px; }
                .article-title { font-size: 40px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 24px; color: var(--text-primary); }
                .article-author { display: flex; align-items: center; gap: 12px; color: var(--text-secondary); font-size: 15px; }

                .article-hero-img { margin-bottom: 48px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); }
                .article-hero-img img { width: 100%; height: auto; display: block; }

                /* Prose Content */
                .article-body { color: var(--text-secondary); font-size: 17px; line-height: 1.7; }
                .prose-h2 { color: var(--text-primary); font-size: 24px; font-weight: 600; margin: 48px 0 24px; letter-spacing: -0.01em; }
                .prose-h3 { color: var(--text-primary); font-size: 20px; font-weight: 500; margin: 32px 0 16px; }
                .prose-p { margin-bottom: 24px; }
                .prose-ul { margin-bottom: 24px; padding-left: 24px; list-style-type: disc; }
                .prose-ul li { margin-bottom: 8px; }
                .prose-p strong, .prose-ul strong { color: var(--text-primary); font-weight: 600; }
                .prose-p code, .prose-ul code { background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 14px; color: var(--brand-primary); }
                .prose-pre { background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 20px; border-radius: 8px; margin-bottom: 24px; overflow-x: auto; }
                .prose-pre code { font-family: monospace; font-size: 14px; color: var(--text-primary); }

                .divider { border: none; border-top: 1px solid var(--border-color); margin: 64px 0; }

                /* Comments */
                .comments-module { margin-bottom: 64px; }
                .comments-title { font-size: 20px; color: var(--text-primary); font-weight: 500; margin-bottom: 32px; }
                
                .comment-item { margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid var(--border-color); }
                .comment-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .comment-header strong { color: var(--text-primary); font-weight: 500; font-size: 15px; }
                .comment-date { color: var(--text-muted); font-size: 13px; }
                .comment-text { color: var(--text-secondary); font-size: 15px; line-height: 1.6; }
                .empty-state { color: var(--text-muted); font-size: 15px; margin-bottom: 48px; }

                .comment-form { background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 24px; border-radius: 12px; }
                .comment-form h4 { color: var(--text-primary); font-size: 16px; font-weight: 500; margin-bottom: 24px; }
                .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0; }
                
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                .captcha-group { display: flex; align-items: center; gap: 12px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; padding: 0 16px; }
                .captcha-group span { color: var(--text-muted); font-size: 14px; white-space: nowrap; }
                .captcha-group input { border: none !important; padding: 12px 0 !important; background: transparent !important; color: var(--text-primary) !important; }
                
                .comment-form input, .comment-form textarea {
                    width: 100%; background: var(--bg-primary); border: 1px solid var(--border-color);
                    color: var(--text-primary); padding: 12px 16px; border-radius: 6px; font-family: 'Inter', sans-serif; font-size: 14px; transition: border-color 0.2s;
                }
                .comment-form input:focus, .comment-form textarea:focus { outline: none; border-color: var(--brand-primary); }
                .form-actions { display: flex; justify-content: flex-end; margin-top: 16px; }
                .btn-submit { background: var(--brand-primary); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
                .btn-submit:hover { opacity: 0.9; }

                .btn-back-bottom {
                    display: flex; align-items: center; gap: 8px; background: none; border: none;
                    color: var(--text-secondary); font-size: 15px; cursor: pointer; transition: color 0.2s;
                }
                .btn-back-bottom:hover { color: var(--brand-primary); }

                @media (max-width: 768px) {
                    .index-header h1 { font-size: 40px; }
                    .featured-card { grid-template-columns: 1fr; gap: 24px; }
                    .post-grid { grid-template-columns: 1fr; }
                    .article-title { font-size: 32px; }
                    .form-row { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Blog;
