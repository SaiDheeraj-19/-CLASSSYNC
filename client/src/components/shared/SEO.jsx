import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, name, type }) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />
            <meta name='keywords' content={keywords} />

            {/* Facebook tags */}
            <meta property='og:type' content={type} />
            <meta property='og:title' content={title} />
            <meta property='og:description' content={description} />

            {/* Twitter tags */}
            <meta name='twitter:creator' content={name} />
            <meta name='twitter:card' content={type} />
            <meta name='twitter:title' content={title} />
            <meta name='twitter:description' content={description} />
        </Helmet>
    );
}

SEO.defaultProps = {
    title: 'ClassSync - Smart Classroom Management',
    description: 'Streamline your educational institution with ClassSync. Manage students, assignments, and grades efficiently.',
    keywords: 'Classroom, Education, LMS, Student Tracking, Grades',
    name: 'ClassSync Team',
    type: 'website'
};

export default SEO;
