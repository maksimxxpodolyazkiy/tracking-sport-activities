import { Component, OnInit, SimpleChanges, OnChanges } from "@angular/core";
import { FirestoreDatabaseService } from "src/app/shared/services/firestore-database.service";
import { FormGroup, FormControl } from "@angular/forms";
import { isTemplateRef } from "ng-zorro-antd";

@Component({
  selector: "app-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"]
})
export class MainComponent implements OnInit, OnChanges {
  constructor(private fds: FirestoreDatabaseService) {}

  public activities$;
  public fbRepeats;

  public activityForm: FormGroup = new FormGroup({
    name: new FormControl(""),
    repeats: new FormControl(""),
    date: new FormControl("")
  });

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
  }

  public ngOnInit(): void {
    this.activities$ = this.fds.getActivities();
    this.fds.getActivities().subscribe(val => {
      const activities = val.map(({ date, repeats }) => {
        const dayOfTheWeek = new Date(date.seconds * 1000).getDay();
        return {
          dayOfTheWeek,
          repeats
        };
      });

      const counts = activities.reduce((prev, curr) => {
        const count = prev.get(curr.dayOfTheWeek) || 0;
        prev.set(curr.dayOfTheWeek, +curr.repeats + count);
        return prev;
      }, new Map());

      const reducedActivities = [...counts].map(([dayOfTheWeek, repeats]) => {
        return { dayOfTheWeek, repeats };
      });

      reducedActivities.sort((a, b) => {
        const dayA = a.dayOfTheWeek;
        const dayB = b.dayOfTheWeek;
        let comparison = 0;
        if (dayA > dayB) {
          comparison = 1;
        } else if (dayA < dayB) {
          comparison = -1;
        }
        return comparison;
      });

      const arrDaysOfTheWeek = [0, 0, 0, 0, 0, 0, 0];
      reducedActivities.forEach(item => {
        arrDaysOfTheWeek[item.dayOfTheWeek] = item.repeats;
      });

      this.fbRepeats = arrDaysOfTheWeek;
    });
  }

  public onAddActivity(): void {
    this.fds.addSingleActivity(this.activityForm.value);
    this.activityForm.patchValue({ name: "", repeats: "" });
  }
}