import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title = 'Eventify - Bespoke Luxury Events & Curated Celebrations',
    description = 'Eventify specializes in luxury weddings, royal ceremonies, corporate summits, and landmark celebrations with bespoke concierge support.',
    keywords = 'luxury events, wedding planner, corporate gala, event concierge, eventify',
    ogImage = 'https://res.cloudinary.com/apfqvcd2/image/upload/v1738156100/eventify_og.jpg',
    canonical,
}) => {
    const siteUrl = window.location.origin;
    const currentUrl = canonical || window.location.href;
    const fullTitle = title.includes('Eventify') ? title : `${title} | Eventify`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={currentUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
        </Helmet>
    );
};

export default SEO;
