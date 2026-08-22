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

export interface ScheduleBlock {
  id: string;
  business_id: string;
  branch_id: string;
  staff_id?: string | null;
  start_date: string;
  end_date: string;
  start_time?: string | null;
  end_time?: string | null;
  reason?: string | null;
  created_at: string;
  staff_name?: string | null;
  branch_name?: string | null;
}

export interface ScheduleBlockInput {
  branch_id: string;
  staff_id?: string | null;
  start_date: string;
  end_date: string;
  start_time?: string | null;
  end_time?: string | null;
  reason?: string | null;
}

