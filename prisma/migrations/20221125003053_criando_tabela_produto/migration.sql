-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "descricao" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "estoque" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Produto_valor_key" ON "Produto"("valor");
