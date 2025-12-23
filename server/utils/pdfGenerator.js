const PDFDocument = require('pdfkit');

/**
 * Generate a PDF report for a batch
 * @param {Object} batch - Batch document with populated fields
 * @param {Array} photos - Array of photo documents
 * @param {Object} manager - Manager user document
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateBatchReport = async (batch, photos, manager) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 40, bottom: 40, left: 40, right: 40 },
                info: {
                    Title: `Batch Report - ${batch.title}`,
                    Author: 'PromoSecure',
                    Subject: 'Promotional Verification Report'
                }
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Colors
            const brandColor = '#0d9488';
            const textColor = '#1e293b';
            const mutedColor = '#64748b';
            const successColor = '#22c55e';
            const warningColor = '#f59e0b';
            const errorColor = '#ef4444';

            const pageWidth = doc.page.width - 80; // 40 margin on each side

            // ============ PAGE 1: HEADER & SUMMARY ============

            // Header Background
            doc.rect(0, 0, doc.page.width, 90).fill(brandColor);

            // Brand Logo
            doc.fontSize(24).fillColor('white').font('Helvetica-Bold')
                .text('PromoSecure', 40, 28);
            doc.fontSize(10).fillColor('rgba(255,255,255,0.9)').font('Helvetica')
                .text('Privacy-First Promotional Verification', 40, 55);

            // Client Name (right)
            if (batch.client?.name) {
                doc.fontSize(12).fillColor('white').font('Helvetica-Bold')
                    .text(batch.client.name, doc.page.width - 200, 35, { width: 160, align: 'right' });
            }

            // Report Date
            doc.fontSize(9).fillColor('rgba(255,255,255,0.8)').font('Helvetica')
                .text(new Date().toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                }), doc.page.width - 200, 52, { width: 160, align: 'right' });

            // ============ BATCH INFO ============
            doc.y = 110;

            // Batch Title
            doc.fontSize(20).fillColor(textColor).font('Helvetica-Bold')
                .text(batch.title, 40, doc.y);

            // Description
            if (batch.description) {
                doc.moveDown(0.3);
                doc.fontSize(10).fillColor(mutedColor).font('Helvetica')
                    .text(batch.description, 40, doc.y, { width: pageWidth });
            }

            // Meta info line
            doc.moveDown(0.5);
            const metaY = doc.y;
            doc.fontSize(9).fillColor(mutedColor).font('Helvetica');

            const metaItems = [];
            if (batch.location) metaItems.push(`📍 ${batch.location}`);
            metaItems.push(`📅 ${new Date(batch.createdAt).toLocaleDateString()}`);
            if (batch.promoter?.name) metaItems.push(`👤 ${batch.promoter.name}`);
            doc.text(metaItems.join('  •  '), 40, metaY);

            // Status Badge
            const statusColors = {
                draft: '#64748b', pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444'
            };
            const statusX = doc.page.width - 120;
            doc.roundedRect(statusX, metaY - 3, 80, 20, 10).fill(statusColors[batch.status] || '#64748b');
            doc.fontSize(10).fillColor('white').font('Helvetica-Bold')
                .text(batch.status.toUpperCase(), statusX, metaY, { width: 80, align: 'center' });

            // ============ SUMMARY STATS BOX ============
            doc.y = metaY + 35;

            // Stats background
            const statsBoxY = doc.y;
            doc.roundedRect(40, statsBoxY, pageWidth, 80, 8).fill('#f8fafc');

            // Calculate stats
            const totalPhotos = photos.length;
            const uniquePhotos = photos.filter(p => p.aiMetadata?.isUnique !== false).length;
            const duplicates = totalPhotos - uniquePhotos;
            const totalFaces = photos.reduce((sum, p) => sum + (p.aiMetadata?.facesDetected || 0), 0);

            // Unique locations
            const uniqueLocations = new Set();
            photos.forEach(p => {
                if (p.location?.latitude && p.location?.longitude) {
                    uniqueLocations.add(`${p.location.latitude.toFixed(3)},${p.location.longitude.toFixed(3)}`);
                }
            });

            // Verification Score
            const verificationScore = batch.aiSummary?.verificationScore ||
                (totalPhotos > 0 ? Math.round((uniquePhotos / totalPhotos) * 100) : 0);

            // Stats Grid (5 items)
            const stats = [
                { label: 'Total Photos', value: totalPhotos, color: brandColor },
                { label: 'Verified Unique', value: uniquePhotos, color: successColor },
                { label: 'Duplicates', value: duplicates, color: duplicates > 0 ? warningColor : successColor },
                { label: 'Faces Blurred', value: totalFaces, color: brandColor },
                { label: 'Locations', value: uniqueLocations.size, color: brandColor },
            ];

            const statWidth = pageWidth / 5;
            stats.forEach((stat, i) => {
                const x = 40 + (i * statWidth);
                doc.fontSize(24).fillColor(stat.color).font('Helvetica-Bold')
                    .text(stat.value.toString(), x, statsBoxY + 18, { width: statWidth, align: 'center' });
                doc.fontSize(8).fillColor(mutedColor).font('Helvetica')
                    .text(stat.label, x, statsBoxY + 48, { width: statWidth, align: 'center' });
            });

            // Verification Score Bar
            doc.y = statsBoxY + 95;
            doc.fontSize(10).fillColor(textColor).font('Helvetica-Bold')
                .text('Verification Score:', 40, doc.y);

            const barX = 140;
            const barWidth = 200;
            const barHeight = 12;
            // Background bar
            doc.roundedRect(barX, doc.y - 2, barWidth, barHeight, 6).fill('#e2e8f0');
            // Score bar
            const scoreColor = verificationScore >= 80 ? successColor : verificationScore >= 50 ? warningColor : errorColor;
            doc.roundedRect(barX, doc.y - 2, barWidth * (verificationScore / 100), barHeight, 6).fill(scoreColor);
            // Score text
            doc.fontSize(11).fillColor(scoreColor).font('Helvetica-Bold')
                .text(`${verificationScore}%`, barX + barWidth + 10, doc.y - 1);

            // ============ PHOTOS SECTION ============
            if (photos.length > 0) {
                doc.y += 35;
                doc.fontSize(14).fillColor(textColor).font('Helvetica-Bold')
                    .text('Captured Photos (Privacy Protected)', 40, doc.y);
                doc.fontSize(9).fillColor(mutedColor).font('Helvetica')
                    .text('All faces have been automatically blurred for privacy compliance', 40, doc.y + 18);

                doc.y += 40;

                // Photo Grid
                const photoCols = 3;
                const photoWidth = (pageWidth - 20) / photoCols;
                const photoHeight = 100;
                const spacing = 10;
                let photoX = 40;
                let photoY = doc.y;
                let photosOnPage = 0;
                const maxPhotosPerPage = 6;

                for (let i = 0; i < Math.min(photos.length, 12); i++) {
                    const photo = photos[i];

                    // New page check
                    if (photoY + photoHeight + 40 > doc.page.height - 50) {
                        doc.addPage();
                        photoY = 50;
                        photosOnPage = 0;
                    }

                    // Photo container
                    doc.roundedRect(photoX, photoY, photoWidth - spacing, photoHeight + 30, 6)
                        .fill('#f1f5f9');

                    // Try to embed actual image
                    if (photo.blurredImage && photo.blurredImage.startsWith('data:image')) {
                        try {
                            // Extract base64 data
                            const base64Data = photo.blurredImage.split(',')[1];
                            const imgBuffer = Buffer.from(base64Data, 'base64');
                            doc.image(imgBuffer, photoX + 3, photoY + 3, {
                                fit: [photoWidth - spacing - 6, photoHeight - 6],
                                align: 'center',
                                valign: 'center'
                            });
                        } catch (imgErr) {
                            // Fallback: placeholder
                            doc.fontSize(8).fillColor(mutedColor)
                                .text('📷 Photo ' + (i + 1), photoX + 5, photoY + photoHeight / 2);
                        }
                    } else {
                        // Placeholder if no image
                        doc.fontSize(10).fillColor(mutedColor).font('Helvetica')
                            .text('📷', photoX + photoWidth / 2 - 10, photoY + photoHeight / 2 - 5);
                    }

                    // Photo info
                    const infoY = photoY + photoHeight + 5;
                    doc.fontSize(7).fillColor(textColor).font('Helvetica-Bold')
                        .text(`Photo ${i + 1}`, photoX + 5, infoY, { width: photoWidth - spacing - 10 });

                    if (photo.capturedAt) {
                        doc.fontSize(6).fillColor(mutedColor).font('Helvetica')
                            .text(new Date(photo.capturedAt).toLocaleString().substring(0, 16),
                                photoX + 5, infoY + 9, { width: photoWidth - spacing - 10 });
                    }

                    // Status badge
                    const isUnique = photo.aiMetadata?.isUnique !== false;
                    doc.fontSize(5).fillColor(isUnique ? successColor : warningColor).font('Helvetica-Bold')
                        .text(isUnique ? '✓ UNIQUE' : '⚠ DUPE',
                            photoX + photoWidth - spacing - 35, infoY, { width: 30, align: 'right' });

                    // Move to next position
                    photoX += photoWidth;
                    if ((i + 1) % photoCols === 0) {
                        photoX = 40;
                        photoY += photoHeight + 45;
                    }
                    photosOnPage++;
                }

                if (photos.length > 12) {
                    doc.y = Math.max(doc.y, photoY + photoHeight + 50);
                    doc.fontSize(9).fillColor(mutedColor).font('Helvetica-Oblique')
                        .text(`+ ${photos.length - 12} more photos in this batch`, 40, doc.y, { align: 'center', width: pageWidth });
                }
            }

            // ============ FOOTER PAGE ============
            doc.addPage();

            // Report Details
            doc.fontSize(16).fillColor(textColor).font('Helvetica-Bold')
                .text('Report Details', 40, 50);

            doc.moveDown(1);
            doc.fontSize(10).fillColor(textColor).font('Helvetica');

            const details = [
                ['Batch ID', batch._id.toString()],
                ['Status', batch.status.charAt(0).toUpperCase() + batch.status.slice(1)],
                ['Manager', manager?.name || 'Not assigned'],
                ['Company', manager?.companyName || 'PromoSecure Client'],
                ['Promoter', batch.promoter?.name || 'Unknown'],
                ['Created', new Date(batch.createdAt).toLocaleString()],
                ['Report Generated', new Date().toLocaleString()],
            ];

            details.forEach(([label, value], i) => {
                const rowY = 90 + (i * 22);
                doc.fontSize(9).fillColor(mutedColor).font('Helvetica')
                    .text(label + ':', 40, rowY, { width: 100 });
                doc.fontSize(9).fillColor(textColor).font('Helvetica')
                    .text(value, 150, rowY, { width: 300 });
            });

            // Footer note
            doc.y = doc.page.height - 150;
            doc.rect(40, doc.y, pageWidth, 1).fill('#e2e8f0');
            doc.moveDown(1);
            doc.fontSize(8).fillColor(mutedColor).font('Helvetica-Oblique')
                .text('This report was automatically generated by PromoSecure.', 40, doc.y, { align: 'center', width: pageWidth })
                .text('All photos have been processed with AI face detection and privacy blurring.', 40, doc.y + 12, { align: 'center', width: pageWidth });

            // Brand footer
            doc.y = doc.page.height - 60;
            doc.fontSize(11).fillColor(brandColor).font('Helvetica-Bold')
                .text('🔒 PromoSecure', 40, doc.y, { align: 'center', width: pageWidth });
            doc.fontSize(8).fillColor(mutedColor).font('Helvetica')
                .text('Privacy-First Promotional Verification Platform', 40, doc.y + 15, { align: 'center', width: pageWidth });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateBatchReport };
