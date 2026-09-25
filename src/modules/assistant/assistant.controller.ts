import { Body, Post, HttpCode, HttpStatus, Controller } from '@nestjs/common';

import { ChatRequestDto } from '@/validation';
import { AssistantService } from '@/modules/assistant/assistant.service';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistant: AssistantService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  chat(@Body() body: ChatRequestDto) {
    return this.assistant.chat(body);
  }
}
