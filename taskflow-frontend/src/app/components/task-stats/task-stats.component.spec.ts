import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskStatsComponent } from './task-stats.component';

describe('TaskStatsComponent', () => {
  let component: TaskStatsComponent;
  let fixture: ComponentFixture<TaskStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskStatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
