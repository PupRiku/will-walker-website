/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { redirect } from 'next/navigation';

export async function handleForm(formData: FormData) {
  redirect('/thank-you');
}
