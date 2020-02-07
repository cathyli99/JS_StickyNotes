/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Initializes the Sticky Notes app.
// CathyLi 2020-02-07 - Initializes the class of StickyNotesApp instead of a function as above
class StickyNotesApp {
  // CathyLi 2020-02-07 - Add a contructor() for the class
  constructor() {
    // Shortcuts to DOM Elements.
    this.notesContainer = document.getElementById('notes-container');
    this.noteMessageInput = document.getElementById('message');
    this.addNoteButton = document.getElementById('save');
    this.notesSectionTitle = document.getElementById('notes-section-title');

    // Saves notes on button click.
    // CathyLi 2020-02-07 - use arrow function autobinding instead of named function binding.
    this.addNoteButton.addEventListener('click', () => this.saveNote());

    // Toggle for the button.
    this.noteMessageInput.addEventListener('keyup', () => this.toggleButton());

    // Loads all the notes.
    for (let key in localStorage) {
      this.displayNote(key, localStorage[key]);
    }

    // Listen for updates to notes from other windows.
    window.addEventListener('storage', e => this.displayNote(e.key, e.newValue));
  }

  // Saves a new sticky note on localStorage.
  // CathyLi 2020-02-07 - update to a class method saveNote() instead of a function method
  saveNote() {
    if (this.noteMessageInput.value) {
      let key = Date.now().toString();
      localStorage.setItem(key, this.noteMessageInput.value);
      this.displayNote(key, this.noteMessageInput.value);
      // CathyLi 2020-02-07 - resetMaterialTextfield is a static method which is called on the class itself (i.e. StickyNotesApp), not on a class instance
      StickyNotesApp.resetMaterialTextfield(this.noteMessageInput); 
      this.toggleButton();
    }
  }

  // Resets the given MaterialTextField.
  // CathyLi 2020-02-07 - update to a static class method resetMaterialTextfield() instead of a function method
  static resetMaterialTextfield(element) {

  // CathyLi 2020-02-07 - reSetMaterialTextfield is a static method, it does not have StickyNotesApp.prototype syntax as other methods
  //StickyNotesApp.resetMaterialTextfield = function(element) {
    element.value = '';
    element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
    element.blur();
  }

  // Creates/updates/deletes a note in the UI.
  // CathyLi 2020-02-07 - update to a class method displayNote(key, message) instead of a function method
  displayNote(key, message) {
    let note = document.getElementById(key);
    // If no element with the given key exists we create a new note.
    if (!note) {
      note = document.createElement('sticky-note');
      note.id = key;
      this.notesContainer.insertBefore(note, this.notesSectionTitle.nextSibling);
    }
    // If the message is null we delete the note.
    if (!message) {
      return note.deleteNote();
    }
    note.setMessage(message);
  }

  // Enables or disables the submit button depending on the values of the input field.
  // CathyLi 2020-02-07- update to a class method toggleButton() instead of a function method
  toggleButton() {
    if (this.noteMessageInput.value) {
      this.addNoteButton.removeAttribute('disabled');
    } else {
      this.addNoteButton.setAttribute('disabled', 'true');
    }
  }
}

// On load start the app.
window.addEventListener('load', () => new StickyNotesApp());

// A Sticky Note custom element that extends HTMLElement.
// CathyLi 2020-02-07 - use clas syntax to create a class element that extends HTMLElement
class StickyNote extends HTMLElement {
  // Fires when an instance of the element is created.
  // CathyLi 2020-02-07 - replaced createCallback() of HTMLElement to connectedCallback()
  connectedCallback() {
    // CathyLi 2020-02-07 - pass any iterable objects (like arrays) and spread them as parameters of function calls
    //    use spread operator on the array of StickyNote.CLASSES[] at the bottom of script

    //StickyNote.CLASSES.forEach(function(klass) {
      //this.classList.add(klass);
    //}.bind(this));

    this.classList.add(...StickyNote.CLASSES);

    this.innerHTML = StickyNote.TEMPLATE;
    this.messageElement = this.querySelector('.message');
    this.dateElement = this.querySelector('.date');
    this.deleteButton = this.querySelector('.delete');
    this.deleteButton.addEventListener('click', () => this.deleteNote());
  }

  // Fires when an attribute of the element is added/deleted/modified.
  attributeChangedCallback(attributeName) {
    // We display/update the created date message if the id changes.
    if (attributeName == 'id') {
      // CathyLi 2020-02-07 - change var to let requires to move date declaration out of if statement
      let date; 
      if (this.id) {
        date = new Date(parseInt(this.id));
      } else {
        date = new Date();
      }

      // CathyLi 2020-02-07 - use Intl.DateTimeFormat to format the date and time
      //let month = StickyNote.MONTHS[date.getMonth()];
      let dateFormatterOptions = { date: 'numeric', month: 'short' };
      let shortDate = new Intl.DateTimeFormat("en-US", dateFormatterOptions).format(date);
      
      // CathyLi 2020-02-07 - replaced the following to template literal
      //this.dateElement.textContent = 'Created on ' + month + ' ' + date.getDate();
      this.dateElement.textContent = `Create on ${ shortDate }`; 
    }
  }

  // Sets the message of the note.
  setMessage(message) {
    this.messageElement.textContent = message;
    // Replace all line breaks by <br>.
    this.messageElement.innerHTML = this.messageElement.innerHTML.replace(/\n/g, '<br>');
  }

  // Deletes the note by removing the element from the DOM and the data from localStorage.
  deleteNote() {
    localStorage.removeItem(this.id);
    this.parentNode.removeChild(this);
  }
}
 
// CathyLi 2020-02-07 - ES2015 did not define any new way to declare static or class fields.
//    You will have to stick to the former syntax (e.g. StickyNote.TEMPLATE = ...). But maybe we'll get this in ES2016/ES7

// Initial content of the element.
// CathyLi 2020-02-07 - uses template literal
StickyNote.TEMPLATE = 
`<div class="message"></div>
 <div class="date"></div>
 <button class="delete mdl-button mdl-js-button mdl-js-ripple-effect"> Delete </button>`;

// StickyNote elements top level style classes.
StickyNote.CLASSES = ['mdl-cell--4-col-desktop', 'mdl-card__supporting-text', 'mdl-cell--12-col',
  'mdl-shadow--2dp', 'mdl-cell--4-col-tablet', 'mdl-card', 'mdl-cell', 'sticky-note'];

// List of shortened month names.
StickyNote.MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov',
                     'Dec'];

// CathyLi 2020-02-07 - removed prototype keyword to apply with class syntax
customElements.define('sticky-note', StickyNote);
