# -*- coding: utf-8 -*-
"""
Created on Sat Apr 11 12:02:31 2020

@author: canth
"""
import datetime
import discord


class Niko(discord.Client):
    cmds = ["hi", "ping", "help", "CanthTime"]
    descs = ["returns a hello", "test response time", "displays helpful messages", "displays the current date and time in CanthLand"]

    async def on_ready(self):
        print('Logged on as {0}!'.format(self.user))
        
    async def on_message(self, message):
        if message.author == self.user:
            #so bot doesn't reply to itself or print its messages
            return
        print('Message from {0.author} in {0.channel}: {0.content}'.format(message))
        await self.process_message(message)

    #processes message contents
    async def process_message(self, message):
        # command handling
        if message.content.startswith('!'):
            await self.process_command(message)
        # greeting response
        elif message.content == 'hi <@!640995889854283778>':
            await self.send_message(message.channel, 'hi <@{0.author.id}>'.format(message))
        #blonk response
        elif message.author.id == 187029344244203531 and 'gm' == message.content:
            await self.send_message(message.channel, 'beep')
            await self.send_message(message.channel, '<:boink:645375650663890956>')

    #processes command in the messages
    async def process_command(self, message):
        mess = message.content[1:].lower()
        if mess == 'hi':
            await self.greet(message)
        elif mess == 'ping':
            await self.ping(message)
        elif mess == 'help':
            await self.help(message)
        elif mess == 'canthtime':
            await self.canth_time(message)
        else:
            await self.unrecognized_cmd(message)

    async def greet(self, message):
        await self.send_message(message.channel, 'Hello World!')

    async def ping(self, message):
        await self.send_message(message.channel, 'Pong!')

    async def unrecognized_cmd(self, message):
        await self.send_message(message.channel, 'Unrecognized Command: use !help')

    async def help(self, message):
        help_mes = "Hey! I'm Niko!\nEvery command must start with !\n+---------------------+\nCommands:\n"
        for i in range(len(self.cmds)):
            help_mes += '!' + self.cmds[i] + '\n'
            help_mes += self.descs[i] + '\n' + '+---------------------+\n'
        await self.send_message(message.channel, help_mes)

    async def canth_time(self, message):
        await self.send_message(message.channel, datetime.datetime.now())

    async def send_message(self, channel, message):
        await channel.send(message)