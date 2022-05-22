"use strict";
const apiBase = "http://127.0.0.1:3000/participants";
const register_form = document.querySelector("#register");
const list = document.querySelector("#list");
const editIcon = '<i class="fa fa-edit edit-icons"></i>';
const saveIcon = '<i class="fa fa-save edit-icons"></i>';

const setDataMode = (parentRef, refButton, dataMode) => {
    const inputs = parentRef.querySelectorAll(".edit-inp");
    if (dataMode === "edit") {
        refButton.setAttribute("data-mode", "edit");
        refButton.innerHTML = editIcon;
        inputs.forEach(input => input.disabled = true);
        parentRef.classList.remove("warn-border");
    }
    else if (dataMode === "save") {
        refButton.setAttribute("data-mode", "save");
        refButton.innerHTML = saveIcon;
        inputs.forEach(input => input.disabled = false);
    }
}

const deleteParticipant = async (id) => {
    const deletePromise = await fetch(`${apiBase}/${id}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
    });

    if(deletePromise.ok) getParticipants();
}

const addParticipant = async (formattedFormData) => {
    const addedPromise = await fetch(`${apiBase}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formattedFormData)
    });

    const added = await addedPromise.json();
    if (Object.keys(added).length) {
        getParticipants();
        register_form.reset();
    }
}

const updateParticipant = async (id, data) => {
    const updatedPromise = await fetch(`${apiBase}/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    return updatedPromise.ok;
}

const activateEdit = (id, defaultData) => {
    const participant = document.querySelector(`#participant-${id}`);
    const clickedButton = participant.querySelector(".edit_save");

    const editInputs = participant.querySelectorAll(".edit-inp");

    if (clickedButton.getAttribute("data-mode") === "edit") {
        setDataMode(participant, clickedButton, "save");
    }
    else {
        if (clickedButton.getAttribute("data-mode") === "save") {
            editInputs.forEach(input => input.disabled = false);
            const [name, birth_year, gender] = editInputs;
            if (!name.value || !birth_year.value || !gender.value) {
                participant.classList.add("warn-border");
            }
            else {
                const {name: defaultName, birth_year: defaultBirthYear, gender: defaultGender} = defaultData;
                if (
                    name.value == defaultName && 
                    birth_year.value == defaultBirthYear &&
                    gender.value == defaultGender
                ) {
                    clickedButton.innerHTML = editIcon;
                    editInputs.forEach(input => input.disabled = true);
                    participant.classList.remove("warn-border");
                }
                else {
                    const updateObj = {
                        name: name.value, 
                        birth_year: birth_year.value, 
                        gender: gender.value
                    };
                    updateParticipant(id, updateObj);
                }
                setDataMode(participant, clickedButton, "edit");
            }
        }
    }
}

const undo = (id, defaultData) => {
    const participant = document.querySelector(`#participant-${id}`);
    const inputs = participant.querySelectorAll(".edit-inp");
    let [nameElement, birth_year_element, gender_element] = inputs;
    const {name, birth_year, gender} = defaultData;
    nameElement.value = name;
    birth_year_element.value = birth_year;
    gender_element.value = gender;
    inputs.forEach(input => input.disabled = true);
}

const createHTML = (item, index) => {
    const {id, name, gender, birth_year} = item;
    const row = document.createElement("tr");
    row.setAttribute("id", `participant-${id}`);
    const html = 
        `<td scope="row">${index + 1}</td>
        <td>
            <input type="text" name="name" value='${name}'  class="edit-inp" disabled required>
        </td>
        <td>
            <input type="number" name="birth_year" value='${birth_year}' class="edit-inp" min-length = "4" max-length="4" disabled required>
        </td>
        <td>
            <select name="gender" disabled class="gender edit-inp">
                <option ${gender === "male" && "selected"} value="male">Male</option>
                <option ${gender === "female" && "selected"} value="female">Female</option>
            </select>
        </td>
        <td scope="col">
            <span role="button" class="edit_save" data-mode="edit">
                ${editIcon}
            </button>
        </td>
        <td scope="col">
            <span role="button" class="undo">
                <i class="fa fa-undo edit-icons"></i>
            </span>
        </td>
        <td scope="col">
            <span role="button" class="delete-button">
                <i class="fa fa-trash-o edit-icons"></i>
            </span>
        </td>
    `;
    row.innerHTML = html;
    row.querySelector(".delete-button").addEventListener("click", () => deleteParticipant(id));
    row.querySelector(".edit_save").addEventListener("click", () => activateEdit(id, item));
    row.querySelector(".undo").addEventListener("click", () => undo(id, item));
    return row;
}

const renderDataHtml = (data) => {
    list.innerHTML = "";
    if (Array.isArray(data)) {
        data.forEach((item, index) => {
           const itemHTML =  createHTML(item, index)
           list.append(itemHTML);
        });
    }
}

const getParticipants = async () => {
    let participants = await fetch(apiBase);
    participants = await participants.json();
    if(participants.length) renderDataHtml (participants);
    else list.innerHTML = "<tr id='no-data-msg'><td colspan='6'>No Participants</td></tr>";
}


register_form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const objToSend = {};
    for(const pair of formData.entries()) {
        console.log(pair[0]);
        objToSend[pair[0]] = pair[1];
    }
    addParticipant(objToSend);
});

getParticipants();