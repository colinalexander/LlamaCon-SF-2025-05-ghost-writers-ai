Build your first CrewAI Agent
----------------------------------

Let’s create a simple crew that will help us `research` and `report` on the `latest AI developments` for a given topic or subject.

Before we proceed, make sure you have finished installing CrewAI. If you haven’t installed them yet, you can do so by following the installation guide.

Follow the steps below to get Crewing! 🚣‍♂️

1

Create your crew

Create a new crew project by running the following command in your terminal. This will create a new directory called `latest-ai-development` with the basic structure for your crew.

Terminal

```shell
crewai create crew latest-ai-development
```

2

Navigate to your new crew project

Terminal

```shell
cd latest-ai-development
```

3

Modify your \`agents.yaml\` file

You can also modify the agents as needed to fit your use case or copy and paste as is to your project. Any variable interpolated in your `agents.yaml` and `tasks.yaml` files like `{topic}` will be replaced by the value of the variable in the `main.py` file.

agents.yaml

```yaml
# src/latest_ai_development/config/agents.yaml
researcher:
role: >
{topic} Senior Data Researcher
goal: >
Uncover cutting-edge developments in {topic}
backstory: >
You're a seasoned researcher with a knack for uncovering the latest
developments in {topic}. Known for your ability to find the most relevant
information and present it in a clear and concise manner.

reporting_analyst:
role: >
{topic} Reporting Analyst
goal: >
Create detailed reports based on {topic} data analysis and research findings
backstory: >
You're a meticulous analyst with a keen eye for detail. You're known for
your ability to turn complex data into clear and concise reports, making
it easy for others to understand and act on the information you provide.
```

4

Modify your \`tasks.yaml\` file

tasks.yaml

```yaml
# src/latest_ai_development/config/tasks.yaml
research_task:
description: >
Conduct a thorough research about {topic}
Make sure you find any interesting and relevant information given
the current year is 2025.
expected_output: >
A list with 10 bullet points of the most relevant information about {topic}
agent: researcher

reporting_task:
description: >
Review the context you got and expand each topic into a full section for a report.
Make sure the report is detailed and contains any and all relevant information.
expected_output: >
A fully fledge reports with the mains topics, each with a full section of information.
Formatted as markdown without '```'
agent: reporting_analyst
output_file: report.md
```

5

Modify your \`crew.py\` file

crew.py

```python
# src/latest_ai_development/crew.py
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import SerperDevTool
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List

@CrewBase
class LatestAiDevelopmentCrew():
"""LatestAiDevelopment crew"""

agents: List[BaseAgent]
tasks: List[Task]

@agent
def researcher(self) -> Agent:
return Agent(
config=self.agents_config['researcher'], # type: ignore[index]
verbose=True,
tools=[SerperDevTool()]
)

@agent
def reporting_analyst(self) -> Agent:
return Agent(
config=self.agents_config['reporting_analyst'], # type: ignore[index]
verbose=True
)

@task
def research_task(self) -> Task:
return Task(
config=self.tasks_config['research_task'], # type: ignore[index]
)

@task
def reporting_task(self) -> Task:
return Task(
config=self.tasks_config['reporting_task'], # type: ignore[index]
output_file='output/report.md' # This is the file that will be contain the final report.
)

@crew
def crew(self) -> Crew:
"""Creates the LatestAiDevelopment crew"""
return Crew(
agents=self.agents, # Automatically created by the @agent decorator
tasks=self.tasks, # Automatically created by the @task decorator
process=Process.sequential,
verbose=True,
)
```

6

\[Optional\] Add before and after crew functions

crew.py

```python
# src/latest_ai_development/crew.py
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task, before_kickoff, after_kickoff
from crewai_tools import SerperDevTool

@CrewBase
class LatestAiDevelopmentCrew():
"""LatestAiDevelopment crew"""

@before_kickoff
def before_kickoff_function(self, inputs):
print(f"Before kickoff function with inputs: {inputs}")
return inputs # You can return the inputs or modify them as needed

@after_kickoff
def after_kickoff_function(self, result):
print(f"After kickoff function with result: {result}")
return result # You can return the result or modify it as needed

# ... remaining code
```

7

Feel free to pass custom inputs to your crew

For example, you can pass the `topic` input to your crew to customize the research and reporting.

main.py

```python
#!/usr/bin/env python
# src/latest_ai_development/main.py
import sys
from latest_ai_development.crew import LatestAiDevelopmentCrew

def run():
"""
Run the crew.
"""
inputs = {
'topic': 'AI Agents'
}
LatestAiDevelopmentCrew().crew().kickoff(inputs=inputs)
```

8

Set your environment variables

Before running your crew, make sure you have the following keys set as environment variables in your `.env` file:

*   An OpenAI API key (or other LLM API key): `OPENAI_API_KEY=sk-...`
*   A Serper.dev API key: `SERPER_API_KEY=YOUR_KEY_HERE`

9

Lock and install the dependencies

*   Lock the dependencies and install them by using the CLI command:

Terminal

```shell
crewai install
```

*   If you have additional packages that you want to install, you can do so by running:

Terminal

```shell
uv add <package-name>
```

10

Run your crew

*   To run your crew, execute the following command in the root of your project:

Terminal

```bash
crewai run
```
