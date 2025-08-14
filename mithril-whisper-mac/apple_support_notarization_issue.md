Hi Apple Developer Support,

I hope you're doing well! I'm reaching out because I'm having an issue with app notarization that's got me a bit stuck.

**My Details:**
- **Name:** Joshua Bernstein
- **Apple ID:** boshjerns@gmail.com  
- **Team ID:** D763V8H675

## What's Happening

I've been trying to get my macOS app "Mithril Whisper" notarized, but I seem to have accidentally created a bit of a mess. Over the past 10+ hours, I've submitted 8 different notarization requests, and every single one is still showing "In Progress" - which seems really unusual since they normally finish in under an hour.

I think I got impatient and kept resubmitting when the first few didn't complete quickly, which probably wasn't the smartest move on my part!

## The Submissions That Are Stuck

Here are all 8 submissions that are just sitting there "In Progress":

**The oldest ones (from late last night/early morning):**
- 5cf438e5-9004-498d-98f8-9b492350574c - submitted around 1:53 AM (over 10 hours ago!)
- efb45bea-e4d7-4e51-afb8-93895f732c84 - submitted around 2:16 AM  
- dc2b6129-9f4d-44d7-8c81-2c3adbad57c7 - submitted around 3:22 AM
- 2a590b90-d4da-4b85-9184-f93f1ca82af7 - submitted around 4:04 AM
- 89b4b274-985b-4af4-802f-e65bc75b451b - submitted around 4:42 AM
- 711231c0-93e3-40a8-968c-d2e0bd483ed3 - submitted around 5:44 AM
- e7625e19-bc4b-4ffd-a7c1-1752384de771 - submitted around 6:25 AM

**The most recent one:**
- 96272d00-0ca2-4bf3-89af-2bdabd1df4ae - submitted around 12:15 PM today

They're all for my "Mithril Whisper" app (7 DMG files and 1 ZIP file).

## What I've Tried

I used the `notarytool` command to check what's going on:
- `xcrun notarytool history` showed me all 8 submissions stuck as "In Progress"
- `xcrun notarytool info` on individual submissions doesn't show any error messages - they're just... sitting there

I've double-checked that my Apple ID credentials and app-specific password are working correctly, and my Developer ID certificate seems fine.

## Why This Is a Problem

I'm trying to release this app to users, but without notarization, macOS will block it from running. So I'm basically stuck until I can get at least one of these notarizations to complete successfully.

## What I'm Hoping You Can Help With

I'm not sure if this is:
- A problem with my app files
- Some kind of service delay on Apple's end
- Something I did wrong by submitting so many times

Could you please take a look at these submissions and either:
1. Help them finish processing, or 
2. Let me know how to cancel them so I can start fresh?

I really appreciate any help you can provide! I know I probably created this mess myself by being impatient, but I'm hoping there's a way to get back on track.

Thanks so much!

**Josh Bernstein**  
Apple ID: boshjerns@gmail.com  
Team ID: D763V8H675
