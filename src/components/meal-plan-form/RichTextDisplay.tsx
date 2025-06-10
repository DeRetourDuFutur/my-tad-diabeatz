// RichTextDisplay.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';

const RichTextDisplay: React.FC<{ text: string }> = ({ text }) => {
  // Fonction pour nettoyer les balises <mcreference>
  const cleanMcReferences = (text: string) => {
    return text.replace(/<mcreference[^>]*>\d+<\/mcreference>/g, '');
  };

  // Nettoyer le texte des balises <mcreference>
  const cleanedText = cleanMcReferences(text);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-xl font-bold text-primary mb-4" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-primary mb-3" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-base font-semibold text-primary mb-2" {...props} />,
          p: ({node, ...props}) => <p className="mb-2 text-sm" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 mb-3" {...props} />,
          li: ({node, ...props}) => <li className="text-sm" {...props} />,
          strong: ({node, ...props}) => {
            const text = props.children?.toString() || '';
            let className = 'font-semibold';
            
            if (text.includes('(en gras et bleu)')) {
              className += ' text-primary';
              props.children = text.replace('(en gras et bleu)', '').trim();
            } else if (text.includes('(en gras et rouge)')) {
              className += ' text-destructive';
              props.children = text.replace('(en gras et rouge)', '').trim();
            }
            
            return <strong className={className} {...props} />;
          }
        }}
      >
        {cleanedText}
      </ReactMarkdown>
    </div>
  );
};

export default RichTextDisplay;