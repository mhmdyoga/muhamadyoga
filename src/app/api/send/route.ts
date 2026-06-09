
import {  NextResponse } from 'next/server';
import { Resend } from "resend";

export async function POST(request: Request) {
    const { name, email, message} = await request.json();

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        await resend.emails.send({
            from: `${name} <message@muhamadyoga.vercel.app>`,
            to: "muhamadyogacp@gmail.com",
            subject: `New message from ${name}`,
            html: `<p>You have a new message from ${name} (${email}):</p><p>${message}</p>`,
        })

        return NextResponse.json({ message: "Email sent successfully" });

    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}