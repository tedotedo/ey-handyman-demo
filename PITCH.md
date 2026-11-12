# Pitch & Handover Sheet — Eaglescliffe & Yarm Handyman (`ey-handyman-demo`)

- **Live Concept URL:** https://tedotedo.github.io/ey-handyman-demo/
- **Prepared for:** Mark Aszkenasy (`tedotedo`)
- **Due Diligence Date:** 12 November 2026

---

## 1. What’s Broken Today & What This Demo Fixes

- **Their `.com` domain was lost in June 2026 and now serves a Chinese 503 error page:** Passive WHOIS and HTTP checks confirm `eyhandyman.com` expired and was drop-caught on **9 June 2026** by a domain-speculation registrar (`Guizhou Zhongyu Zhike Network Technology Co., Ltd.`, nameservers `ns1.onclouddns.com` / `ns1.julydns.com`). Anyone clicking their old link on a van, business card, or Google Business Profile hits an HTTP 503 page titled `站点正在建设中` ("Site under construction" in Simplified Chinese).
- **Google has now wiped their old WordPress pages from search:** Because the drop-caught server sends `x-robots-tag: noindex, nofollow` alongside HTTP 503, the stale WordPress pages (`/?page_id=8`, etc.) that were still lingering in search results in October 2026 have now dropped out of Google completely (`site:eyhandyman.com` returns zero results). Homeowners searching *"handyman Yarm"* or *"handyman Eaglescliffe"* only see regional directory aggregators (Checkatrade, Bark, MyBuilder) and competitors.
- **Clean `.co.uk` escape hatch (no ransom needed):** Passive Nominet UK checks (12 Nov 2026) confirm **`eyhandyman.co.uk`**, **`ey-handyman.co.uk`**, and **`eaglescliffehandyman.co.uk`** are all **unregistered**. Instead of paying hundreds of pounds to buy back `.com` from a drop-catcher, the owner can move straight onto `eyhandyman.co.uk` for ~£8–£10/year—which also reads more locally British to TS15/TS16 homeowners.
- **Built around how homeowners actually hire a handyman ("the fridge to-do list"):** Rather than a vague contact box, the 4-page brochure lets a homeowner tick multiple jobs on `Services & Jobs` (e.g. *ease a sticking door + hang curtain poles + reseal shower*), carries those selections automatically into `Request a Quote`, and asks for area (`TS16` / `TS15`) and wall/fittings details upfront—saving the owner back-and-forth phone tag.
- **Zero-bloat, mobile-first & privacy-clean:** Self-hosted fonts, fast editorial layout built for `360px–390px` phones (with a sticky bottom Call + Quote dock), WCAG AA contrast, and zero cookies or trackers.

---

## 2. Outreach Opener & 3-Tap Phone Demo Script

*(Because a handyman is a mobile trade with no High Street shopfront, outreach will likely happen via their Google Business Profile number, local Facebook community page, or spotting their liveried van around Eaglescliffe/Yarm.)*

### 20-Second Opener (Phone / Message / In-Person)
> *"Hi — I'm Mark, I live locally. I tried looking up Eaglescliffe & Yarm Handyman online and noticed `eyhandyman.com` expired back in June and was grabbed by an overseas domain parker showing a Chinese error page—which means anyone clicking your old website link thinks you've packed up. Good news is `eyhandyman.co.uk` is completely free to register for a tenner, and I've mocked up a clean 4-page website on my phone to show how easily we could get you back at the top of Google in Yarm and Eaglescliffe. Can I text you the link—no obligation at all?"*

### 3-Tap Live Demo Flow (30 Seconds on Mobile)
1. **Home hero (`index.html`):** Show how immediately clear it is at `390px`—*Eaglescliffe & Yarm (TS16 & TS15)* front and centre, plus the sticky bottom **Call** and **Get a Quote** bar.
2. **Interactive Job Checklist (`services.html`):** Tap **Build Your Odd-Job List**, tick 2–3 everyday jobs (*Shelving*, *Sticking door*, *Silicone resealing*), and point out the live counter badge updating (`3 jobs added`).
3. **Pre-filled Quote Form (`quote.html`):** Tap **Continue to Quote Form**—those 3 jobs are already ticked. Show how the homeowner picks `Eaglescliffe (TS16)` or `Yarm (TS15)` and submits a clean, structured lead straight to their phone/email instead of vague voicemails.

### Common Objections & Straight Answers
- **"I get enough work from word of mouth / Facebook groups."**
  *"Word of mouth is gold—the catch is the first thing someone does when a neighbour recommends 'Eaglescliffe & Yarm Handyman' is Google your name to get your number. Right now if they hit `eyhandyman.com` and see a Chinese error screen, they assume you've retired and ring Checkatrade instead."*
- **"I don't want to pay ransom for my old `.com` domain."**
  *"Don't pay them a penny. `eyhandyman.co.uk` is unregistered right now—it costs less than £10 a year in your own name, and `.co.uk` actually looks more local than `.com`."*
- **"I haven't got time to write pages of website text."**
  *"Everything is already written and laid out. Give me 5 minutes on the phone to confirm your mobile number, hours, which jobs you do and don't take on, and your rough areas—and we're ready."*

---

## 3. Google Business Profile (GBP) Tidy-Up Plan (Included Value-Add)

When launching the live site, walk through these 5 quick fixes on their Google Business Profile:
1. **Swap the broken website URL immediately:** Replace `https://eyhandyman.com` with the new `https://eyhandyman.co.uk` (with `?utm_source=gbp` optional only if they ever want basic stats—otherwise plain clean URL).
2. **Configure as a Service-Area Business (hide home street address):** Keep street address hidden for privacy and list explicit service areas: **Eaglescliffe**, **Yarm**, **Egglescliffe**, **Preston-on-Tees**, **Kirklevington**, **Ingleby Barwick** (matching whatever radius the owner confirms).
3. **Categories:** Primary category `Handyman/Handywoman/Handyperson`; secondary categories matching their real work (e.g. `Carpenter`, `Furniture maker` / assembly, `Property maintenance`).
4. **Services & Job List sync:** Copy the confirmed 4 job categories from `services.html` into GBP's structured "Services" tab so Google matches searches like *"flat pack assembly Yarm"* or *"hang shelves Eaglescliffe"*.
5. **Real before/after job photos:** Replace stock/illustrative demo photos over time with 5–10 quick phone snaps of real tidy jobs (alcove shelves, re-hung oak doors, neat silicone lines—taken with homeowner permission and no house numbers visible).

---

## 4. Complete Owner Placeholder Checklist (To Go Live)

Every bracketed `[...]` item in the concept site that needs a quick yes/no or figure from the owner:

- [ ] **Direct Phone / Mobile / WhatsApp (`[Phone – owner to confirm]`):** Enables 1-tap `tel:` links in the header, hero, footer, and sticky mobile dock.
- [ ] **Email Address (`[Email – owner to confirm]`):** Destination for quote form submissions and direct enquiries.
- [ ] **Working Days & Hours (`[Working hours – owner to confirm]`):** e.g., Mon–Fri 8am–5pm, Saturday mornings by arrangement.
- [ ] **Pricing Structure (`[Call-out / hourly / half-day rate – owner to confirm]`):** Whether they publish guide rates (e.g. first hour + half-hour increments / half-day / fixed-price per job) or prefer *"Free no-obligation quote per job list"* without figures on-page, plus `[Materials policy – owner to confirm]`.
- [ ] **Insurance Cover (`[Public liability insurance cover – owner to confirm]`):** e.g., £1m / £2m / £5m public liability insurance (only state exact figure once verified).
- [ ] **Exact Service List & Exclusions (`[Exact service list – owner to confirm]` / `[Owner's exact trade qualifications & exclusions – owner to confirm]`):** Confirm which of the 12 checklist items to keep/add/remove (e.g., plumbing tap washers, decorating, gutter clearing, or exclusions like Gas Safe / Part P electrics / roofing).
- [ ] **Exact Coverage Radius (`[Exact TS16 sub-areas – owner to confirm]`, `[Exact TS15 sub-areas – owner to confirm]`, `[Surrounding villages & travel radius – owner to confirm]`):** Confirm outlying villages (Ingleby Barwick, Kirklevington, Hutton Rudby, Stockton, etc.).
- [ ] **Registered Business / Sole Trader Footer Details (`[Registered town / base details – owner to confirm]`):** Trading name / sole trader or Ltd details if applicable, and preferred domain (`eyhandyman.co.uk`).
- [ ] **Photos (Optional post-launch upgrade):** Swap or supplement the 3 `"Illustrative image"` demo photographs with the owner's own photos of completed work if available.

