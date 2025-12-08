#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <winsock2.h> 
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib") 

#define PORT 8080
#define BUFFER_SIZE 2048      //缓冲区大小
#define MAX_CONNECTIONS 1     //最大连接等待数

// 命令执行逻辑，待确认
void execute_command(const char* command, char* response_buffer) {
    if (strncmp(command, "PING", 4) == 0) {
        strcpy(response_buffer, "PONG (C Core is running)");
    } else if (strncmp(command, "SEARCH", 6) == 0) {
        //模拟返回json格式搜索结果
        strcpy(response_buffer, "{\"status\":\"ok\", \"results\":[{\"name\":\"test song\"}]}");
    } else if (strncmp(command, "PLAY", 4) == 0) {
        //模拟返回json格式播放成功提示
        strcpy(response_buffer, "{\"status\":\"ok\", \"message\":\"Playing next song\"}");
    } else {
        strcpy(response_buffer, "{\"status\":\"error\", \"message\":\"Unknown Command\"}");
    }
}

// 客户端请求处理函数
void handle_client_request(SOCKET client_socket) {
    char buffer[BUFFER_SIZE] = {0};   // 定义接收缓冲区：存储客户端发来的命令（初始化为0）
    char response[BUFFER_SIZE] = {0};  // 定义响应缓冲区：存储要返回给客户端的结果（初始化为0）

    while(1) { 
        int valread = recv(client_socket, buffer, BUFFER_SIZE - 1, 0);   //存储recv()函数的返回值：实际接收到的字节数; recv()参数：客户端Socket、接收缓冲区、缓冲区大小-1（留1个字节存'\0'）、flags=0（默认模式）
        if(valread >0) {
            buffer[valread] = '\0'; 
            printf("Received command: %s\n", buffer);

            // 执行核心逻辑
            execute_command(buffer, response);

            send(client_socket, response, strlen(response), 0);
        
            memset(buffer, 0, BUFFER_SIZE);
            memset(response, 0, BUFFER_SIZE);

        } else if(valread == 0) {
            printf("Client disconnected gracefully.\n");
            break;
        } else {
            printf("Receive error. Error: %d\n", WSAGetLastError());
            break;
        }    
    }
    closesocket(client_socket);  
    printf("complete\n");
}

int main() {
    // Winsock 初始化
    // MAKEWORD(2,2)：指定使用Winsock 2.2版本；&wsa：把初始化信息存入wsa变量
    WSADATA wsa;    // 定义WSAData结构体变量：用来存储Winsock初始化的信息
    int ret = WSAStartup(MAKEWORD(2,2), &wsa);
    if (ret != 0) {
        printf("Winsock Initialization Failed. Error Code: %d\n", WSAGetLastError());
        return 1;
    } else {
        printf("Winsock Initialized.\n");
    }
    
    // 定义Socket相关变量： server_fd：服务端Socket句柄（服务端的通信端口号）; new_socket：客户端Socket句柄（和单个客户端通信的“通道”）
    SOCKET server_fd, new_socket;
    struct sockaddr_in address;    // 定义sockaddr_in结构体：存储IP地址、端口等网络地址信息（IPv4专用）
    int addrlen = sizeof(address);    // 计算address结构体的大小（bind/accept函数需要）

    //创建 Socket 文件描述符 (类型：AF_INET IPv4, SOCK_STREAM TCP)
    server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd == INVALID_SOCKET) {
        printf("Socket creation failed. Error: %d\n", WSAGetLastError());
        WSACleanup();
        return 1;
    } else {
        printf("Socket bilud success. server_fd = %u\n",(unsigned int)server_fd);
    }
    
    // 设置地址结构
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY; 
    address.sin_port = htons(PORT);  // htons()：把主机字节序的端口号转成网络字节序

    //绑定 Socket 到端口（把server_fd和8080端口绑定，让客户端能找到这个端口）
    int bind_result = bind(server_fd, (struct sockaddr *)&address, sizeof(address));  //bind()函数：将Socket和指定的IP+端口关联
    if (bind_result == SOCKET_ERROR) {
        printf("Bind failed. Error: %d\n", WSAGetLastError());
        closesocket(server_fd);
        WSACleanup();
        return 1;
    }

    //监听连接（让服务端Socket进入“监听状态”，等待客户端连接）
    int listen_result = listen(server_fd, MAX_CONNECTIONS);  //listen()函数：服务端Socket；最大等待连接数（MAX_CONNECTIONS=1）
    if (listen_result == SOCKET_ERROR) {
        printf("Listen failed. Error: %d\n", WSAGetLastError());
        closesocket(server_fd);
        WSACleanup();
        return 1;
    } else {
        printf("C Core Server listening on port %d\n", PORT);
    }
    

    // 主循环：接受并处理连接
    while(1) {
        printf("\nWaiting for a connection...\n");
        
        // 接受客户端连接（调用会阻塞）
        // accept()函数：从等待队列中取出一个客户端连接，返回“客户端Socket句柄”
        // (struct sockaddr *)&address：存储客户端的IP和端口；&addrlen：地址结构体大小
        new_socket = accept(server_fd, (struct sockaddr *)&address, &addrlen);
        if (new_socket == INVALID_SOCKET) { 
            printf("Accept failed. Error: %d\n", WSAGetLastError());   //连接失败，跳过等待下一次来凝结
            continue;
        }

        // 使用 inet_ntoa 打印客户端 IP （把网络字节序的IP地址转成字符串）
        // ntohs() 把网络字节序的端口转成主机字节序
        printf("Connection established with %s:%d\n", inet_ntoa(address.sin_addr), ntohs(address.sin_port));
        
        //处理客户端请求
        handle_client_request(new_socket);

        closesocket(new_socket); 
        printf("Connection closed.\n");
    }
    
}

//server 启动
//gcc socket_server.c -o socket_server -mconsole -lws2_32 ;  if ($?) { .\socket_server }