'use client';

import { Button } from '@/components/ui/button';
import { 
  Heart,
  Bookmark,
  Download,
  Share2,
  ThumbsUp
} from 'lucide-react';

interface InteractionButtonsProps {
  workflowId: string;
  isLiked?: boolean;
  isFavorited?: boolean;
  hasDownloaded?: boolean;
  onLike?: () => void;
  onFavorite?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  className?: string;
}

export default function InteractionButtons({
  workflowId,
  isLiked = false,
  isFavorited = false,
  hasDownloaded = false,
  onLike,
  onFavorite,
  onDownload,
  onShare,
  className = ''
}: InteractionButtonsProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Button
        variant={isLiked ? "default" : "outline"}
        size="sm"
        onClick={onLike}
        className="flex items-center gap-2"
      >
        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
        {isLiked ? '已点赞' : '点赞'}
      </Button>
      
      <Button
        variant={isFavorited ? "default" : "outline"}
        size="sm"
        onClick={onFavorite}
        className={`flex items-center gap-2 ${isFavorited ? 'text-yellow-600' : ''}`}
      >
        <Bookmark className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
        {isFavorited ? '已收藏' : '收藏'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onDownload}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        下载
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onShare}
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        分享
      </Button>
    </div>
  );
}