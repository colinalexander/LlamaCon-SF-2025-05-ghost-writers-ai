"""
CrewAI service for Ghost-Writers.AI scene generation.
Implements the AI agent crew system for BE-006.
"""

import os
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging

from crewai import Agent, Crew, Task, Process, LLM
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class SceneGenerationCrew:
    """Crew for scene generation using CrewAI."""

    def __init__(
        self,
        project_id: str,
        scene_id: str,
        word_count: int,
        include_characters: List[str],
        include_memory: bool,
        project_metadata: Optional[Dict[str, Any]] = None,
        character_data: Optional[List[Dict[str, Any]]] = None,
        memory_data: Optional[List[Dict[str, Any]]] = None,
    ):
        """
        Initialize the scene generation crew.

        Args:
            project_id: Project identifier
            scene_id: Scene identifier
            word_count: Target word count between 500-5000
            include_characters: List of character IDs to include
            include_memory: Whether to include memory context
            project_metadata: Additional project metadata
            character_data: Character data for included characters
            memory_data: Memory data if include_memory is True
        """
        self.project_id = project_id
        self.scene_id = scene_id
        self.word_count = word_count
        self.include_characters = include_characters
        self.include_memory = include_memory
        self.project_metadata = project_metadata or {}
        self.character_data = character_data or []
        self.memory_data = memory_data or []
        self.generation_id = str(uuid.uuid4())

        # Convenience: default model once
        self.llm_model = LLM(
            model="groq/meta-llama/llama-4-maverick-17b-128e-instruct",
            temperature=0.6
        )

    # ------------------------------------------------------------------
    # Agent helpers
    # ------------------------------------------------------------------
    def plot_architect_agent(self) -> Agent:
        return Agent(
            role="Plot Architect",
            goal=f"Design a compelling plot structure and narrative arc for a scene of approximately {self.word_count} words",
            backstory=(
                "You are an expert storyteller with a talent for crafting "
                "engaging narrative structures. You understand pacing, tension, "
                "and how to create satisfying scene arcs within the larger story context."
            ),
            verbose=True,
            llm=self.llm_model,
        )

    def character_coach_agent(self) -> Agent:
        return Agent(
            role="Character Coach",
            goal="Ensure character actions, dialogue, and internal thoughts are consistent, compelling, and reveal personality",
            backstory=(
                "You excel at writing authentic character voices and "
                "creating dialogue that reveals personality and advances the plot. You ensure that characters "
                "stay true to their established traits and motivations across scenes."
            ),
            verbose=True,
            llm=self.llm_model,
        )

    def prose_stylist_agent(self) -> Agent:
        return Agent(
            role="Prose Stylist",
            goal=f"Write and polish scene prose to meet stylistic requirements and a target word count of {self.word_count}",
            backstory=(
                "You have an eye for beautiful prose and can elevate "
                "any text through careful word choice, sentence structure, and pacing. You maintain "
                "the desired tone and style while making the text flow elegantly."
            ),
            verbose=True,
            llm=self.llm_model,
        )

    def memory_keeper_agent(self) -> Agent:
        return Agent(
            role="Memory Keeper",
            goal="Verify scene continuity against established facts, character histories, and world details",
            backstory=(
                "You are meticulous about narrative consistency. You cross-reference scene details "
                "with established facts, character histories, and world-building details to ensure "
                "a cohesive story."
            ),
            verbose=True,
            llm=self.llm_model,
        )

    # ------------------------------------------------------------------
    # Task helpers (parameterised so we can reuse instances)
    # ------------------------------------------------------------------
    def outline_task(self) -> Task:
        """Create the scene outline task."""

        # Project‑level context
        genre = self.project_metadata.get("genre", "unspecified")
        audience = self.project_metadata.get("audience", "unspecified")
        style = self.project_metadata.get("style", "unspecified")

        # Character context
        character_context = ""
        if self.character_data:
            character_context = "Characters in this scene:\n"
            for char in self.character_data:
                character_context += f"- {char.get('name', 'Unknown')}: {char.get('traits', '')}\n"
                if "motivation" in char:
                    character_context += f"  Motivation: {char.get('motivation')}\n"
                if "relationships" in char:
                    character_context += f"  Relationships: {char.get('relationships')}\n"

        # Memory context
        memory_context = ""
        if self.include_memory and self.memory_data:
            memory_context = "Important context from previous scenes:\n"
            for memory in self.memory_data:
                category = memory.get("category", "General")
                text = memory.get("text", "")
                memory_context += f"- {category}: {text}\n"

        return Task(
            description=(
                f"Create a detailed scene outline for a {genre} story aimed at {audience} readers, "
                f"written in a {style} style. The final scene should be approximately {self.word_count} words long.\n\n"
                f"**Project Context:**\n"
                f"- Genre: {genre}\n"
                f"- Audience: {audience}\n"
                f"- Style: {style}\n\n"
                f"**Character Context:**\n{character_context}\n"
                f"**Memory Context (Previous Events):**\n{memory_context}\n"
                "**Your Task:** Create a detailed scene outline focusing on these key elements:\n"
                "1.  **Setting & Atmosphere:** Describe the location, time, and mood.\n"
                "2.  **Character Objectives:** What does each character want in this scene?\n"
                "3.  **Plot Points:** Key events, conflicts, and revelations.\n"
                "4.  **Emotional Arc:** How characters' feelings change; key emotional beats.\n"
                "5.  **Scene Structure:** A clear beginning, rising action, climax, falling action, and resolution for the scene.\n\n"
                "Include at least 5 specific, tangible details or events that MUST be present in the final scene prose."
            ),
            agent=self.plot_architect_agent(),
            expected_output=(
                "A detailed scene outline in MARKDOWN format. It must include sections for: \n"
                "- Setting & Atmosphere\n"
                "- Character Objectives\n"
                "- Plot Points (including 5+ specific required elements)\n"
                "- Emotional Arc\n"
                "- Scene Structure (Beginning, Middle, End)"
            ),
        )

    def character_task(self, outline: Task) -> Task:
        """Create the character development and dialogue task."""

        return Task(
            description=(
                "Based on the provided scene outline, develop the character interactions, dialogue, and internal thoughts.\n\n"
                "**Your Task:** Focus on the following aspects:\n"
                "1.  **Distinctive Voices:** Write dialogue that clearly reflects each character's unique personality, background, and current emotional state.\n"
                "2.  **Plot Advancement:** Ensure dialogue and actions move the scene's plot forward and contribute to character goals.\n"
                "3.  **Show, Don't Tell:** Reveal emotions and intentions through subtext, actions, and reactions, rather than explicit statements.\n"
                "4.  **Consistency:** Maintain consistency with established character traits, motivations, and relationships (referencing provided context).\n"
                "5.  **Scene Arc:** Ensure each character involved has a mini-arc or development within the scene, however small.\n\n"
                "Include at least one specific moment of dialogue OR action for each primary character that reveals a key aspect of their personality or motivation."
            ),
            agent=self.character_coach_agent(),
            expected_output=(
                "A document detailing character interactions for the scene. It must include: \n"
                "- Key dialogue snippets for major interactions.\n"
                "- Descriptions of significant character actions and non-verbal cues.\n"
                "- Notes on internal thoughts or feelings for point-of-view characters.\n"
                "- Explicit mention of the 'revealing moment' for each character."
            ),
            context=[outline],
        )

    def prose_task(self, outline: Task, character: Task) -> Task:
        """Create the prose writing task."""

        return Task(
            description=(
                f"Using the scene outline and character details, write the full scene prose.\n\n"
                f"**Your Task:** Ensure your writing adheres to these requirements:\n"
                "1.  **Style & Tone:** Match the project's specified style ({self.project_metadata.get('style', 'unspecified')}) and tone.\n"
                "2.  **Sensory Details:** Include vivid descriptions engaging multiple senses (sight, sound, smell, touch) to immerse the reader.\n"
                "3.  **Pacing & Flow:** Vary sentence structure and paragraph length to control pacing; ensure smooth transitions.\n"
                f"4.  **Word Count:** Target approximately {self.word_count} words for the final scene.\n"
                "5.  **Genre Conventions:** Use language and tropes appropriate for the genre ({self.project_metadata.get('genre', 'unspecified')}).\n\n"
                "Integrate dialogue naturally. Blend action, description, and character thought seamlessly."
            ),
            agent=self.prose_stylist_agent(),
            expected_output=(
                f"The complete scene text, formatted as prose (paragraphs, dialogue, etc.). \n"
                f"The total word count should be close to {self.word_count}.\n"
                f"The prose must seamlessly integrate the outline's plot points and the character details."
            ),
            context=[outline, character],
        )

    def continuity_task(self, prose: Task) -> Task:
        """Create the continuity check task."""

        # Prepare context strings from instance data
        if self.include_memory and self.memory_data:
            # Convert list of dicts to a simple string representation for the prompt
            memory_context = "\n".join([str(item) for item in self.memory_data])
        else:
            memory_context = "Memory context was not requested or is unavailable."

        if self.character_data:
            # Convert list of dicts to a simple string representation for the prompt
            character_context = "\n".join([str(item) for item in self.character_data])
        else:
            character_context = "Character context is unavailable."

        return Task(
            description=(
                "Review the generated scene prose against the provided memory context and character details.\n\n"
                f"**Memory Context Provided:**\n{memory_context}\n"
                f"**Character Context Provided:**\n{character_context}\n\n"
                "**Your Task:** Verify the following:\n"
                "1.  **Factual Consistency:** Does the scene contradict any established facts from the memory context?\n"
                "2.  **Character History:** Do character actions/dialogue align with their known history and established relationships?\n"
                "3.  **World Building:** Does the scene maintain consistency with established world rules or details?\n\n"
                "Identify any specific sentences or elements in the prose that conflict with the provided context."
            ),
            agent=self.memory_keeper_agent(),
            expected_output=(
                "A brief report in MARKDOWN format. \n"
                "- If inconsistencies are found: List each inconsistency, citing the specific conflicting element in the prose and the relevant context point.\n"
                "- If NO inconsistencies are found: State 'No continuity issues found.'"
            ),
            context=[prose],
        )

    # ------------------------------------------------------------------
    # Crew assembly & execution
    # ------------------------------------------------------------------
    def create_crew(self) -> Crew:
        """Create the scene generation crew."""

        # Build tasks once so contexts refer to the same objects
        outline = self.outline_task()
        character = self.character_task(outline)
        prose = self.prose_task(outline, character)

        tasks = [outline, character, prose]
        agents = [
            outline.agent,
            character.agent,
            prose.agent,
        ]

        if self.include_memory:
            continuity = self.continuity_task(prose)
            tasks.append(continuity)
            agents.append(continuity.agent)

        return Crew(agents=agents, tasks=tasks, verbose=True, process=Process.sequential)

    def generate_scene(self) -> Dict[str, Any]:
        """Execute the scene generation process and return the result."""

        crew = self.create_crew()
        result = crew.kickoff()  # CrewOutput

        # Ensure we get the output from the PROSE task (always index 2)
        # The final result from kickoff() might be the continuity task if enabled.
        prose_task_output = None
        if result and hasattr(result, 'tasks_output') and len(result.tasks_output) > 2:
            prose_task_output = result.tasks_output[2] # Get the TaskOutput for the prose task

        # Extract the raw text from the prose task's output
        raw_text = ""
        if prose_task_output:
            raw_text = prose_task_output.raw if hasattr(prose_task_output, "raw") else str(prose_task_output)
        else:
            # Fallback or error handling if prose output isn't found
            raw_text = str(result.raw) if hasattr(result, "raw") else str(result)
            logger.warning(f"Could not find prose task output (index 2) in CrewOutput. Falling back to final result. Result: {raw_text[:100]}...")

        word_count = len(raw_text.split())

        return {
            "scene_id": self.scene_id,
            "generated_text": raw_text,
            "word_count": word_count,
            "characters_included": self.include_characters,
            "memory_included": self.include_memory,
            "generation_id": self.generation_id,
            "created_at": datetime.now(),
        }