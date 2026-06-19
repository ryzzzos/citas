export interface ScheduleInterval {
  start: string;
  end: string;
}

export interface Schedule {
  id: string;
  business_id: string;
  branch_id: string;
  staff_id: string;
  day_of_week: number;
  intervals: ScheduleInterval[];
}

export interface UpdateStaffSchedulesInput {
  schedules: {
    day_of_week: number;
    intervals: ScheduleInterval[];
  }[];
}
