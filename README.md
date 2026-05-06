# Vantum Clinic Provider App

This project has been converted from a Vite web prototype into a React Native app powered by Expo.

## Run locally

1. Install dependencies:
   `npm install`
2. Start the Expo dev server:
   `npm run start`
3. Open it in:
   `npm run android`
   `npm run ios`
   `npm run web`

## Current mobile scope

- Native authentication flow
- Dashboard and bottom navigation
- Patient queue and patient detail
- Telehealth, tasks, billing, RPM, labs, messages, notifications, and profile screens
- Shared mock clinical data carried over from the original prototype

## Notes

- The previous web source is still in the repository for reference, but the active app entry is now [`App.tsx`](/C:/Users/guda.reddy/Documents/vantum-clinic-provider-app/App.tsx).
- After changing dependencies, regenerate `package-lock.json` with `npm install`.
