"""
CrewAI service for Ghost-Writers.AI scene generation.
Implements the AI agent crew system for BE-006.
"""

import os
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

from crewai import Agent, Crew, Task, Process, LLM
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


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
            goal="Design the plot structure and narrative arc for the scene",
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
            goal="Ensure character consistency and compelling dialogue",
            backstory=(
                "You excel at writing authentic character voices and "
                "creating dialogue that reveals personality. You ensure that characters "
                "stay true to their established traits and motivations across scenes."
            ),
            verbose=True,
            llm=self.llm_model,
        )

    def prose_stylist_agent(self) -> Agent:
        return Agent(
            role="Prose Stylist",
            goal="Polish the prose and ensure stylistic consistency",
            backstory=(
                "You have an eye for beautiful prose and can elevate "
                "any text through careful word choice and sentence structure. You maintain "
                "the desired tone and style while making the text flow elegantly."
            ),
            verbose=True,
            llm=self.llm_model,
        )

    def memory_keeper_agent(self) -> Agent:
        return Agent(
            role="Memory Keeper",
            goal="Maintain continuity with previous scenes and established facts",
            backstory=(
                "You excel at maintaining narrative consistency by keeping track "
                "of established facts, character histories, and world-building details. You ensure "
                "that new scenes align with what has come before."
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
                f"written in {style} style. The final scene should be approximately {self.word_count} words.\n\n"
                f"{character_context}\n"
                f"{memory_context}\n"
                "Your outline should include:\n"
                "1. Setting and atmosphere\n"
                "2. Character objectives in the scene\n"
                "3. Key plot points and revelations\n"
                "4. Emotional beats and character development\n"
                "5. Scene structure (beginning, middle, end)\n\n"
                "Be specific and vivid in your descriptions. Include at least 5 key elements that must "
                "appear in the final scene."
            ),
            agent=self.plot_architect_agent(),
            expected_output="A detailed scene outline with setting, characters, plot points, and structure.",
        )

    def character_task(self, outline: Task) -> Task:
        """Create the character development and dialogue task."""

        return Task(
            description=(
                "Based on the scene outline, develop the character interactions and dialogue.\n\n"
                "Focus on:\n"
                "1. Creating distinctive character voices that reflect their personality\n"
                "2. Writing dialogue that advances the plot\n"
                "3. Showing (not telling) character emotions through dialogue and actions\n"
                "4. Ensuring character consistency with established traits\n"
                "5. Creating meaningful character arcs within the scene\n\n"
                "For each character, include at least one moment that reveals something about their personality or advances their arc."
            ),
            agent=self.character_coach_agent(),
            expected_output="Detailed character interactions and dialogue for the scene.",
            context=[outline],
        )

    def prose_task(self, outline: Task, character: Task) -> Task:
        """Create the prose writing task."""

        return Task(
            description=(
                f"Transform the scene outline and character work into flowing prose.\n\n"
                "Your writing should:\n"
                "1. Match the desired style and tone for the project\n"
                "2. Include vivid sensory details and imagery\n"
                "3. Vary sentence structure and pacing for effect\n"
                f"4. Maintain around {self.word_count} words total\n"
                "5. Use appropriate genre conventions\n\n"
                "Blend the dialogue naturally into the prose, and ensure the scene flows smoothly from beginning to end."
            ),
            agent=self.prose_stylist_agent(),
            expected_output="A complete scene in polished prose form.",
            context=[outline, character],
        )

    def continuity_task(self, prose: Task) -> Task:
        """Create the continuity check task."""

        return Task(
            description=(
                "Review the completed scene for continuity with established facts and memory.\n\n"
                "Check for:\n"
                "1. Consistency with previous events and established character traits\n"
                "2. Proper integration of world-building elements\n"
                "3. Logical progression from previous scenes\n"
                "4. Potential continuity errors or contradictions\n"
                "5. Opportunities to strengthen connections to the broader narrative\n\n"
                "If you find any issues, provide specific corrections. If the scene maintains good continuity,\n"
                "highlight the strongest connections to previous material."
            ),
            agent=self.memory_keeper_agent(),
            expected_output="A final version of the scene with continuity issues resolved and connections strengthened.",
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

        raw_text = result.raw if hasattr(result, "raw") else str(result)
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