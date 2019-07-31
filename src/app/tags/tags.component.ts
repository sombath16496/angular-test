import { Component, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import {
  debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';

import { TagService } from '../tag.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {
  private unAddedTagsStrObservable = new Subject<any>();

  unAddedTagsStr: string;
  existingTagsArr: string[];

  editTagsStr: string;

  constructor(private tagService: TagService, 
    private modalService: NgbModal) { }

  // Push unAddedTagsStr text into the observable stream.
  storeUnAddedTagsStrFromInput(term: string): void {
    this.unAddedTagsStrObservable.next(term);
    // this.tagService.storeUnAddedTags(term);
  }

  ngOnInit() {
    this.unAddedTagsStrObservable.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),
      // ignore new term if same as previous term
      distinctUntilChanged(),      
      // switch to new unAddedTagsStr observable each time the term changes
      switchMap((newTerm: string) => this.tagService.storeUnAddedTags(newTerm))
    ).subscribe(result => { });

    // Fetch initial data from Local storage
    this.getUnAddedTagsStr();
    this.getExistingTags();
  }

  breakStringIntoArrayByDelimiter(rawStr:string): string[] 
  {
    // Remove white spaces
    const tempRawStr = rawStr.trim();
    if(tempRawStr === "") return null;

    // Split tag values
    const delimiters = [" ", ":", ";", ",", "\n"];
    const splitArray = tempRawStr.split(new RegExp(delimiters.join('|'), 'g'));

    // Filter numbers
    const numericArray = splitArray.filter(item=>(!isNaN(Number(item)) && item.trim() !== "")).map(item => item.replace(/\s/g, ""));

    if(numericArray.length === 0)
      return null;
    else
      return numericArray;
  }

  getUnAddedTagsStr(): void {
    this.tagService.getUnAddedTags()
    .subscribe(unAddedTagsStr => this.unAddedTagsStr = (unAddedTagsStr === "null" || unAddedTagsStr === "undefined") ? "" : unAddedTagsStr);
  }

  getExistingTags(): void {
    this.tagService.getExistingTags()
    .subscribe(existingTagsStr => this.existingTagsArr = existingTagsStr === null ? [] : JSON.parse(existingTagsStr));
  }  

  // Add unAdded Tags to existing Tags
  addTags(unAddedTagsStr:string): void {
    const unAddedTagsStrToBeStored = unAddedTagsStr;
    const normalizedArray = this.breakStringIntoArrayByDelimiter(unAddedTagsStrToBeStored);
    if(normalizedArray == null) return;

    // concatenate new tages to existing one
    this.existingTagsArr = this.existingTagsArr==null ? normalizedArray : this.existingTagsArr.concat(normalizedArray);

    // save existing tags to local storage
    this.tagService.storeExistingTags(JSON.stringify(this.existingTagsArr));

    // save unadded tags to local storage
    this.tagService.storeUnAddedTags("");
  }

  // Delete existing Tab
  delete(i: number) {
    this.existingTagsArr = this.existingTagsArr.filter((val, index)=>index !== i);

    // save updated existing tags to local storage
    this.tagService.storeExistingTags(JSON.stringify(this.existingTagsArr));
  }

  // Open up edit tags modal
  editTags(content) {
    if(this.existingTagsArr === null || this.existingTagsArr.length === 0)
      this.editTagsStr = "";
    else
      this.editTagsStr = this.existingTagsArr.join(",");

    this.modalService.open(content);
  }

  saveEditTags(newExistingTagsStr:string) { 
    this.modalService.dismissAll();

    const normalizedArray = this.breakStringIntoArrayByDelimiter(newExistingTagsStr);

    // concatenate new tages to existing one
    this.existingTagsArr = normalizedArray;

    // save existing tags to local storage
    this.tagService.storeExistingTags(JSON.stringify(this.existingTagsArr));
  }

}
