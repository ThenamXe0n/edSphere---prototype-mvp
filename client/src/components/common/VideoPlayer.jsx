import React from 'react';
import { FiAlertCircle, FiVideo } from 'react-icons/fi';

const VideoPlayer = ({ videoUrl, title = 'Lecture Video' }) => {
  // Helper to extract YouTube video ID and construct embed URL
  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // Check if it's already an embed URL
    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);

      if (match && match[2].length === 11) {
        const videoId = match[2];
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
      }
    } catch (e) {
      console.error('Failed to parse video URL:', e);
    }

    // Fallback: return original URL if no match
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  if (!videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center aspect-video bg-slate-900 text-slate-500 rounded-3xl p-6 border border-slate-800 text-center">
        <FiVideo size={48} className="text-slate-700 mb-3 animate-pulse" />
        <h4 className="text-sm font-semibold text-slate-400">No Video Loaded</h4>
        <p className="text-xs text-slate-600 max-w-xs mt-1">Select a module from the checklist to start playing the video lecture.</p>
      </div>
    );
  }

  // If the parsed URL doesn't look like an embed URL, or fails to parse, show warning placeholder but try to render
  const isEmbeddable = embedUrl.includes('embed') || embedUrl.startsWith('http');

  if (!isEmbeddable) {
    return (
      <div className="flex flex-col items-center justify-center aspect-video bg-slate-950 text-slate-500 rounded-3xl p-6 border border-slate-800 text-center">
        <FiAlertCircle size={40} className="text-amber-500 mb-3" />
        <h4 className="text-sm font-semibold text-slate-400">Unsupported Video Source</h4>
        <p className="text-xs text-slate-600 mt-1 max-w-xs">
          This URL could not be parsed as an embeddable format. Please click the link to watch it externally.
        </p>
        <a href={videoUrl} target="_blank" rel="noreferrer" className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition duration-150">
          Watch Externally
        </a>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-lg border border-slate-200">
      <iframe
        src={embedUrl}
        title={title}
        className="absolute top-0 left-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        frameBorder="0"
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
