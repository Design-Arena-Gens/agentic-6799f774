import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a professional, friendly AI phone assistant for an Italian restaurant. Your role is to:

1. RESERVATIONS: Help customers make, modify, or cancel reservations
   - Ask for: date, time, party size, name, and phone number
   - Check availability (simulate - always available but mention if prime times fill up)
   - Confirm all details back to the customer

2. MENU QUESTIONS: Answer questions about menu items, ingredients, and dietary restrictions
   - Specialties: Fresh handmade pasta, wood-fired pizzas, seafood dishes
   - Dietary options available: vegetarian, vegan, gluten-free options
   - Popular dishes: Truffle Mushroom Ravioli, Margherita Pizza, Osso Buco

3. HOURS & LOCATION:
   - Monday-Thursday: 11am-10pm
   - Friday-Saturday: 11am-11pm
   - Sunday: 12pm-9pm
   - Address: 123 Main Street, Downtown, CA 94102

4. GENERAL INQUIRIES: Parking, dress code, private events, gift cards

Keep responses conversational, warm, and concise. Always confirm important details. If you don't know something, offer to have a manager call back.`

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Simple rule-based responses for demo (no external API needed)
    const lastMessage = messages[messages.length - 1].content.toLowerCase()

    let response = ''

    // Reservation keywords
    if (lastMessage.includes('reservation') || lastMessage.includes('book') || lastMessage.includes('table')) {
      if (lastMessage.match(/\d+\s*(people|person|guests?)/i)) {
        const partySize = lastMessage.match(/(\d+)\s*(people|person|guests?)/i)?.[1]
        response = `Perfect! I'd be happy to help you reserve a table for ${partySize}. What date and time would you prefer? We're open Monday-Thursday 11am-10pm, Friday-Saturday 11am-11pm, and Sunday 12pm-9pm.`
      } else if (lastMessage.match(/(tomorrow|tonight|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i) && lastMessage.match(/\d+\s*(am|pm|:)/i)) {
        response = `Excellent! I can confirm that reservation for you. May I have your name and phone number to complete the booking? We'll send you a confirmation text.`
      } else {
        response = `I'd be delighted to help with your reservation! How many guests will be joining you, and what date and time works best?`
      }
    }
    // Menu questions
    else if (lastMessage.includes('menu') || lastMessage.includes('food') || lastMessage.includes('dish') || lastMessage.includes('special')) {
      response = `We specialize in authentic Italian cuisine! Our most popular dishes include our handmade Truffle Mushroom Ravioli, wood-fired Margherita Pizza, and slow-braised Osso Buco. We also have wonderful seafood dishes and fresh salads. Are you interested in any particular type of cuisine or have any dietary restrictions?`
    }
    // Dietary restrictions
    else if (lastMessage.includes('vegan') || lastMessage.includes('vegetarian') || lastMessage.includes('gluten') || lastMessage.includes('allergy')) {
      response = `We absolutely accommodate dietary restrictions! We have dedicated vegetarian and vegan options, including vegan pasta dishes and pizzas with dairy-free cheese. We also offer gluten-free pasta and pizza crusts. Our chef is happy to modify dishes for allergies - just let your server know when you arrive.`
    }
    // Hours
    else if (lastMessage.includes('hour') || lastMessage.includes('open') || lastMessage.includes('close') || lastMessage.includes('time')) {
      response = `We're open Monday through Thursday from 11am to 10pm, Friday and Saturday from 11am to 11pm, and Sunday from 12pm to 9pm. Would you like to make a reservation?`
    }
    // Location/directions
    else if (lastMessage.includes('location') || lastMessage.includes('address') || lastMessage.includes('where') || lastMessage.includes('parking')) {
      response = `We're located at 123 Main Street in Downtown, CA 94102. There's street parking available, and we also validate parking for the garage on 5th Avenue. We're about a 5-minute walk from the Main Street metro station. Can I help you with anything else?`
    }
    // Greeting
    else if (lastMessage.includes('hello') || lastMessage.includes('hi') || lastMessage === 'hey') {
      response = `Hello! Thank you for calling. How may I assist you today? I can help with reservations, answer menu questions, or provide information about our hours and location.`
    }
    // Thank you / goodbye
    else if (lastMessage.includes('thank') || lastMessage.includes('bye') || lastMessage.includes('goodbye')) {
      response = `You're very welcome! Thank you for calling, and we look forward to serving you. Have a wonderful day! 🍝`
    }
    // Default
    else {
      response = `I'd be happy to help you with that! I can assist with making reservations, answering questions about our menu and specialties, or providing information about our hours and location. What would you like to know?`
    }

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
