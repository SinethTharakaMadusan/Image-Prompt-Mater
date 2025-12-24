import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAOjjB0UvUuDiwF7rbdjiS3F_3UwITewB4"; // Get this from aistudio.google.com
const genAI = new GoogleGenerativeAI(API_KEY);

const genBtn = document.getElementById('genBtn');
const loader = document.getElementById('loader');
const resultCard = document.getElementById('resultCard');

genBtn.addEventListener('click', async () => {
    const input = document.getElementById('userInput').value;
    if (!input) return alert("Please enter a topic!");

    // Show loader, hide old result
    loader.classList.remove('hidden');
    resultCard.classList.add('hidden');

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const systemPrompt = `Return JSON for an image about "${input}":
        {
          "name": "Attractive Title",
          "tags": ["tag1", "tag2", "...up to 10"],
          "description": "Description under 175 characters",
          "ai_prompt": "Technical prompt for image gen"
        }`;

        const result = await model.generateContent(systemPrompt);
        let text = result.response.text();

        // Clean up markdown if present
        if (text.startsWith('```json')) {
            text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (text.startsWith('```')) {
            text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const data = JSON.parse(text);

        // Enforce 175 character limit
        if (data.description.length > 175) {
            data.description = data.description.substring(0, 175);
        }

        // Update UI
        document.getElementById('imgName').innerText = data.name;
        document.getElementById('imgDesc').innerText = data.description;
        document.getElementById('charCount').innerText = `${data.description.length} characters`;
        document.getElementById('imgPrompt').innerText = data.ai_prompt;

        // Update Tags
        const tagList = document.getElementById('tagList');
        tagList.innerHTML = data.tags.map(t => {
            const cleanTag = t.replace(/\s+/g, '');
            return `<span class="tag" onclick="copySingleTag(this)" title="Click to copy">${cleanTag}</span>`;
        }).join('');

        loader.classList.add('hidden');
        resultCard.classList.remove('hidden');

    } catch (error) {
        console.error("GenAI Error:", error);
        alert(`Error generating data: ${error.message || "Check console/API key"}`);
        loader.classList.add('hidden');
    }
});

// Copy function
window.copyPrompt = () => {
    const text = document.getElementById('imgPrompt').innerText;
    navigator.clipboard.writeText(text);
    alert("Prompt copied to clipboard!");
}

window.copyTags = () => {
    const tags = Array.from(document.querySelectorAll('#tagList .tag'))
        .map(tag => tag.innerText)
        .join(' ');

    if (!tags) return alert("No tags to copy!");

    navigator.clipboard.writeText(tags);
    alert("Tags copied to clipboard!");
}

window.copySingleTag = (element) => {
    const tag = element.innerText;
    navigator.clipboard.writeText(tag);

    const originalText = element.innerText;
    element.innerText = "Copied!";
    element.classList.add('copied');

    setTimeout(() => {
        element.innerText = originalText;
        // Keep the copied class to show history
    }, 1000);
}

window.copyDescription = () => {
    const element = document.getElementById('imgDesc');
    const text = element.innerText;

    if (!text) return;

    navigator.clipboard.writeText(text);
}

window.copyName = () => {
    const element = document.getElementById('imgName');
    const text = element.innerText;

    if (!text) return;

    navigator.clipboard.writeText(text);
    // Silent copy specific to user preference
}


