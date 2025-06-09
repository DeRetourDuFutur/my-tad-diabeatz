// RichTextDisplay.tsx
import React from 'react';

const RichTextDisplay: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const elements: JSX.Element[] = [];
  let currentListItems: string[] = [];
  let currentSectionTitle: React.ReactNode = null;
  let inList = false;

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <div key={`section-list-${elements.length}`} className="mb-3">
          {currentSectionTitle && <div className="mb-1">{currentSectionTitle}</div>}
          <ul className="list-disc pl-5 space-y-0.5">
            {currentListItems.map((item, idx) => (
              <li key={`li-${elements.length}-${idx}`} className="text-sm">{item}</li>
            ))}
          </ul>
        </div>
      );
      currentListItems = [];
      currentSectionTitle = null;
      inList = false;
    } else if (currentSectionTitle) {
        elements.push(<div key={`title-only-${elements.length}`} className="mb-1">{currentSectionTitle}</div>);
        currentSectionTitle = null;
    }
  };

  lines.forEach((line, index) => {
    const titleMatch = line.match(/^\*\*(.*?)\*\*/);
    const listItemMatch = line.match(/^- (.*)/);

    if (titleMatch) {
      flushList();
      let titleContent = titleMatch[1];
      let titleClasses = "font-semibold text-foreground";
      if (titleContent.includes("(en gras et bleu)")) {
        titleClasses = "font-semibold text-primary";
        titleContent = titleContent.replace("(en gras et bleu)", "").trim();
      } else if (titleContent.includes("(en gras et rouge)")) {
        titleClasses = "font-semibold text-destructive";
        titleContent = titleContent.replace("(en gras et rouge)", "").trim();
      } else if (titleContent.includes("(en gras)")) {
         titleContent = titleContent.replace("(en gras)", "").trim();
      }
      currentSectionTitle = <p className={titleClasses}>{titleContent}</p>;
    } else if (listItemMatch) {
      if (!inList && currentSectionTitle) {
        inList = true;
      } else if (!inList) {
        flushList(); 
        inList = true;
      }
      currentListItems.push(listItemMatch[1]);
    } else if (line.trim() !== "") { 
      flushList(); 
      elements.push(<p key={`p-${index}`} className="mb-1 text-sm">{line}</p>);
    }
  });

  flushList(); 

  return <div className="prose prose-sm dark:prose-invert max-w-none">{elements}</div>;
};

export default RichTextDisplay;