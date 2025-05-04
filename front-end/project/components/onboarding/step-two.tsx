'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StepTwoData {
  title: string;
  description: string;
  tone: string;
}

interface StepTwoProps {
  data: StepTwoData;
  updateData: (data: Partial<StepTwoData>) => void;
}

export default function OnboardingStepTwo({ data, updateData }: StepTwoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Story Title</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value })}
          placeholder="Enter your story title"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="description">One-Line Description</Label>
          <span className="text-xs text-muted-foreground">
            {data.description.length}/500 characters
          </span>
        </div>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value.slice(0, 500) })}
          placeholder="Summarize your story in one sentence"
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tone">Story Tone</Label>
        <Select
          value={data.tone}
          onValueChange={(value) => updateData({ tone: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[300px]">
              {/* Emotional Intensity */}
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                Emotional Intensity
              </div>
              <SelectItem value="dark-gritty">Dark & Gritty</SelectItem>
              <SelectItem value="tense-paranoid">Tense & Paranoid</SelectItem>
              <SelectItem value="emotional-raw">Emotional & Raw</SelectItem>
              <SelectItem value="melancholic">Melancholic</SelectItem>
              <SelectItem value="hopeful-uplifting">Hopeful & Uplifting</SelectItem>
              <SelectItem value="lighthearted">Lighthearted</SelectItem>

              {/* Intellectual & Serious */}
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                Intellectual & Serious
              </div>
              <SelectItem value="philosophical">Philosophical</SelectItem>
              <SelectItem value="cerebral-reflective">Cerebral & Reflective</SelectItem>
              <SelectItem value="somber">Somber</SelectItem>
              <SelectItem value="realistic-grounded">Realistic & Grounded</SelectItem>
              <SelectItem value="morally-complex">Morally Complex</SelectItem>

              {/* Stylistic / Genre-Driven */}
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                Stylistic / Genre-Driven
              </div>
              <SelectItem value="noir">Noir</SelectItem>
              <SelectItem value="whimsical">Whimsical</SelectItem>
              <SelectItem value="magical-lyrical">Magical & Lyrical</SelectItem>
              <SelectItem value="surreal">Surreal</SelectItem>
              <SelectItem value="satirical">Satirical</SelectItem>
              <SelectItem value="epic-grand">Epic & Grand</SelectItem>
              <SelectItem value="cold-procedural">Cold & Procedural</SelectItem>
              <SelectItem value="mysterious">Mysterious</SelectItem>
              <SelectItem value="high-stakes-thriller">High-Stakes Thriller</SelectItem>

              {/* Humorous Spectrum */}
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                Humorous Spectrum
              </div>
              <SelectItem value="witty-clever">Witty & Clever</SelectItem>
              <SelectItem value="dark-humor">Dark Humor</SelectItem>
              <SelectItem value="absurdist">Absurdist</SelectItem>
              <SelectItem value="slapstick">Slapstick</SelectItem>
              <SelectItem value="dry-deadpan">Dry & Deadpan</SelectItem>
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
