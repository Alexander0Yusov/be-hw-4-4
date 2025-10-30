import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';

// Не экспортируйте ничего из main.ts, чтобы избежать повторного запуска приложения
// при выполнении тестов. (Node.js автоматически выполняет код импортируемого файла.)

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appSetup(app);

  const PORT = process.env.PORT || 5001;

  await app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
  });
}

bootstrap();
