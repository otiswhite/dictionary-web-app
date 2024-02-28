const searchTerm = document.querySelector("#search-term");
const searchBtn = document.querySelector("#search-button");
const title = document.querySelector(".word");
const textPron = document.querySelector(".text-pronounciation");
const audioPron = document.querySelector(".audio-pronounciation");
const playBtn = document.querySelector("#play-icon");
const meaningsNoun = document.querySelector("#lis-noun");
const meaningsVerb = document.querySelector("#lis-verb");
const meaningsAdjective = document.querySelector("#lis-adjective");
const meaningsAdverb = document.querySelector("#lis-adverb");
const meaningsInterjection = document.querySelector("#lis-interjection");
const meaningsConjunction = document.querySelector("#lis-conjunction");
const containerNoun = document.querySelector("#nouns");
const containerVerb = document.querySelector("#verbs");
const containerAdjective = document.querySelector("#adjectives");
const containerAdverb = document.querySelector("#adverbs");
const containerInterjection = document.querySelector("#interjections");
const containerConjunction = document.querySelector("#conjunction");
const linkA = document.querySelector("#source-link-a");
const linkContainer = document.querySelector("#source-link");

// searchTerm.addEventListener("keyup", e => {
// 	console.dir(searchTerm.value);
// });

// fetch json file for the search term
const fetchData = async word => {
	const link = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
	try {
		const response = await fetch(link);
		if (response.status === 200) {
			addSource(link, "add");
			return response.json();
		} else if (response.status === 404) {
			title.innerHTML = "Definition not found";
			textPron.innerText = "";
			console.dir(response);
		} else {
			throw new Error(response);
		}
	} catch (error) {
		removeOldContent();
		textPron.innerText = "";
		console.dir(error);

		title.innerHTML = "Failed to load data";
		console.log("Error:", error.status, error);
	}
};

// remove old data from previous search
const removeOldContent = () => {
	const remove = container => {
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}
	};
	remove(meaningsNoun);
	remove(meaningsVerb);
	remove(meaningsAdjective);
	remove(meaningsAdverb);
	remove(meaningsInterjection);
	remove(meaningsConjunction);
};

// hide all containers
const hideContainers = () => {
	[
		containerNoun,
		containerVerb,
		containerAdjective,
		containerAdverb,
		containerInterjection,
		containerConjunction,
	].map(cont => {
		if (!cont.classList.contains("hidden")) {
			cont.classList.add("hidden");
		}
	});
	if (!linkContainer.classList.contains("hidden")) {
		linkContainer.classList.add("hidden");
	}
};

// add / remove source link
const addSource = (link = "", command = "") => {
	if (command === "add") {
		linkA.innerText = link;
		linkA.href = link;
		linkContainer.classList.remove("hidden");
	} else {
		linkA.innerText = "";
		linkA.href = "";
		linkContainer.classList.add("hidden");
	}
};

// listen for enter or search button and search for the word and reset input value
searchBtn.addEventListener("click", async e => {
	e.preventDefault();
	hideContainers();
	// remove source link
	addSource();
	// get definitions
	if (searchTerm.value.length > 0) {
		const data = await fetchData(searchTerm.value);
		removeOldContent();
		getPronounciationAndTitle(data);
		getMeaningsAndDefinitions(data);
	} else {
		removeOldContent();
		textPron.innerText = "";
		title.innerHTML = "Please enter a word to search";
	}
	searchTerm.value = "";
});

// add play on the audio pronounciation icon
playBtn.addEventListener("click", () => {
	audioPron.play();
	// let a = 0;
	// if (a === 0) {
	// 	audioPron.play();
	// 	a++;
	// } else if (a === 1) {
	// 	audioPron.stop();
	// 	a--;
	// }
});

// extract word, text and audio pronounciation and show all if available
const getPronounciationAndTitle = data => {
	title.innerText = data[0].word;
	const pronounciation = [];
	const audioLinks = [];
	if (data[0].phonetic) pronounciation.push(data[0].phonetic);
	data[0].phonetics.map(arr => {
		if (arr.sourceUrl) {
			audioLinks.push(arr.audio);
		}
		if (arr.text && arr.text.length > 0) {
			pronounciation.push(arr.text);
		}
	});
	pronounciation[0]
		? (textPron.innerText = pronounciation[0] || pronounciation[1])
		: (textPron.innerText = "");
	audioPron.src = audioLinks[0] || audioLinks[1];
	audioLinks.length > 0
		? playBtn.classList.remove("hidden")
		: playBtn.classList.add("hidden");
};

// show definitions if available
const displayDefinitions = (wordType, container, hideContainer) => {
	// show if definitions available
	if (wordType.length > 0) hideContainer.classList.remove("hidden");
	// extract def, antonyms and synonyms
	if (wordType[0]) {
		const definitions = wordType[0].definitions.map(def => [
			def.definition,
			def.example,
		]);
		const antonyms = wordType[0].antonyms.map(def => def);
		const synonyms = wordType[0].synonyms.map(def => def);

		// add definitions and example sentences
		const listItem = item => {
			const newLi = document.createElement("li");
			const newP = document.createElement("p");
			newP.classList.add("grey");
			newLi.innerText = item[0];
			if (item[1]) {
				newP.innerText = `"${item[1]}"`;
				newLi.appendChild(newP);
			}
			container.appendChild(newLi);
		};
		definitions.map(item => listItem(item));

		// add synonyms if any
		if (synonyms[0]) {
			const newPa = document.createElement("p");
			const synTitle = document.createElement("span");
			const synContent = document.createElement("span");
			newPa.classList.add("syn-ant");
			synTitle.classList.add("syn-ant-title");
			synContent.classList.add("syn-ant-content");
			synTitle.innerText = "Synonyms:";
			newPa.appendChild(synTitle);
			synContent.innerText = synonyms.join(", ");
			newPa.appendChild(synContent);
			container.appendChild(newPa);
		}
		// add antonyms
		if (antonyms[0]) {
			const newPa = document.createElement("p");
			const antTitle = document.createElement("span");
			const antContent = document.createElement("span");
			newPa.classList.add("syn-ant");
			antTitle.classList.add("syn-ant-title");
			antContent.classList.add("syn-ant-content");
			antTitle.innerText = "Antonyms:";
			newPa.appendChild(antTitle);
			antContent.innerText = antonyms.join(", ");
			newPa.appendChild(antContent);
			container.appendChild(newPa);
		}
	}
};

// extract meaning and definitions
const getMeaningsAndDefinitions = data => {
	// console.log(data);
	const noun = [];
	const verb = [];
	const adjective = [];
	const adverb = [];
	const interjection = [];
	const conjunction = [];
	// add definitions
	data[0].meanings.map(obj => {
		// console.log(obj);
		if (obj.partOfSpeech === "noun") noun.push(obj);
		if (obj.partOfSpeech === "verb") verb.push(obj);
		if (obj.partOfSpeech === "adjective") adjective.push(obj);
		if (obj.partOfSpeech === "adverb") adverb.push(obj);
		if (obj.partOfSpeech === "interjection") interjection.push(obj);
		if (obj.partOfSpeech === "conjunction") conjunction.push(obj);
	});

	// display definitions and hide empty containers
	displayDefinitions(noun, meaningsNoun, containerNoun);
	displayDefinitions(verb, meaningsVerb, containerVerb);
	displayDefinitions(adjective, meaningsAdjective, containerAdjective);
	displayDefinitions(adverb, meaningsAdverb, containerAdverb);
	displayDefinitions(interjection, meaningsInterjection, containerInterjection);
	displayDefinitions(conjunction, meaningsConjunction, containerConjunction);
};

// color schemes, light dark theme toggler

// get items from dom and local storage
const toggleSwitch = document.querySelector("#checkbox");
const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");

// work out current theme on reload and set it
if (localStorage.getItem("theme")) {
	document.documentElement.setAttribute(
		"data-theme",
		localStorage.getItem("theme")
	);
	toggleSwitch.checked = false;
	if (localStorage.getItem("theme") === "dark") {
		toggleSwitch.checked = true;
	}
} else {
	if (systemSettingDark.matches) {
		document.documentElement.setAttribute("data-theme", "dark");
		toggleSwitch.checked = true;
	} else {
		document.documentElement.setAttribute("data-theme", "light");
		toggleSwitch.checked = false;
	}
}

// watching for dark mode changes
const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
darkModeMediaQuery.addEventListener("change", e => {
	const darkModeOn = e.matches;
	// console.log(`Dark mode is ${darkModeOn ? "🌒 on" : "☀️ off"}.`);
	if (!localStorage.getItem("theme")) {
		if (darkModeOn) {
			document.documentElement.setAttribute("data-theme", "dark");
			toggleSwitch.checked = true;
		} else {
			document.documentElement.setAttribute("data-theme", "light");
			toggleSwitch.checked = false;
		}
	} else {
		document.documentElement.setAttribute(
			"data-theme",
			localStorage.getItem("theme")
		);
		toggleSwitch.checked = false;
		if (localStorage.getItem("theme") === "dark") {
			toggleSwitch.checked = true;
		}
	}
});

// watch for toggle switch changes
toggleSwitch.addEventListener("click", e => {
	if (e.target.checked) {
		document.documentElement.setAttribute("data-theme", "dark");
		toggleSwitch.checked = true;
		localStorage.setItem("theme", "dark");
	} else {
		document.documentElement.setAttribute("data-theme", "light");
		toggleSwitch.checked = false;
		localStorage.setItem("theme", "light");
	}
});

// watch for font drop down menu change and apply
const fontSelect = document.querySelector("#font");

font.addEventListener("change", e => {
	if (e.target.value === "serif") {
		document.body.style.fontFamily = "var(--font-sans-serif)";
	}
	if (e.target.value === "sansserif") {
		document.body.style.fontFamily = "var(--font-serif)";
	}
	if (e.target.value === "monospace") {
		document.body.style.fontFamily = "var(--font-monospace)";
	}
});
