export interface GoogleProfileData {
  email: string;
  name: string;
  role?: 'jobseeker' | 'employer';
  companyName?: string;
  picture?: string;
}
