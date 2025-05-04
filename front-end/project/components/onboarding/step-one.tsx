'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StepOneProps {
  data: {
    genre: string;
    audience: string;
    style: string;
    storyLength: string;
  };
  updateData: (data: Partial<typeof data>) => void;
}

export default function OnboardingStepOne({ data, updateData }: StepOneProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="genre">Genre</Label>
        <Select
          value={data.genre}
          onValueChange={(value) => updateData({ genre: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select genre" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              <SelectItem value="thriller">Thriller</SelectItem>
              <SelectItem value="spy-novel">Spy Novel</SelectItem>
              <SelectItem value="fantasy">Fantasy</SelectItem>
              <SelectItem value="science-fiction">Science Fiction</SelectItem>
              <SelectItem value="romance">Romance</SelectItem>
              <SelectItem value="mystery">Mystery</SelectItem>
              <SelectItem value="historical-fiction">Historical Fiction</SelectItem>
              <SelectItem value="horror">Horror</SelectItem>
              <SelectItem value="young-adult">Young Adult</SelectItem>
              <SelectItem value="adventure">Adventure</SelectItem>
              <SelectItem value="comedy">Comedy</SelectItem>
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="audience">Target Audience</Label>
        <Select
          value={data.audience}
          onValueChange={(value) => updateData({ audience: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="children">Children (6–12)</SelectItem>
            <SelectItem value="young-adult">Young Adult (13–17)</SelectItem>
            <SelectItem value="adult">Adult (18+)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="style">Writing Style</Label>
        <Select
          value={data.style}
          onValueChange={(value) => updateData({ style: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              <SelectItem value="cinematic">Cinematic and fast-paced</SelectItem>
              <SelectItem value="descriptive">Descriptive and lyrical</SelectItem>
              <SelectItem value="sparse">Sparse and clipped</SelectItem>
              <SelectItem value="dark">Dark and atmospheric</SelectItem>
              <SelectItem value="witty">Witty and dialogue-driven</SelectItem>
              <SelectItem value="elegant">Elegant and formal</SelectItem>
              <SelectItem value="simple">Simple and accessible</SelectItem>
              <SelectItem value="reflective">Reflective and introspective</SelectItem>
              <SelectItem value="analytical">Cold and analytical</SelectItem>
              <SelectItem value="hardboiled">Hardboiled and gritty</SelectItem>
              <SelectItem value="playful">Playful and ironic</SelectItem>
              <SelectItem value="philosophical">Philosophical and speculative</SelectItem>
              <SelectItem value="tense">Tense and paranoid</SelectItem>
              <SelectItem value="whimsical">Whimsical and magical</SelectItem>
              <SelectItem value="detached">Detached and observational</SelectItem>
              <SelectItem value="intimate">Intimate and emotional</SelectItem>
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="storyLength">Story Length</Label>
        <Select
          value={data.storyLength}
          onValueChange={(value) => updateData({ storyLength: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select length" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flash">Flash Fiction (Under 1,000 words, 1 chapter)</SelectItem>
            <SelectItem value="short-story">Short Story (1,000 – 7,500 words, 1 chapter)</SelectItem>
            <SelectItem value="novelette">Novelette (7,500 – 17,500 words, 3 chapters)</SelectItem>
            <SelectItem value="novella">Novella (17,500 – 40,000 words, 6 chapters)</SelectItem>
            <SelectItem value="short-novel">Short Novel (40,000 – 60,000 words, 10 chapters)</SelectItem>
            <SelectItem value="novel">Novel (60,000 – 100,000 words, 15 chapters)</SelectItem>
            <SelectItem value="epic">Epic Novel (100,000 – 200,000+ words, 25 chapters)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}